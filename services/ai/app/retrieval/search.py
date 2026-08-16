"""Retrieval-only search: returns cited passages, never a generated answer.

This exists so Module 1A (document browser + ingestion) can ship
before Module 1B (the grounded RAG chat, which adds an LLM generation
+ citation-validation + abstention layer on top of this same index).
Nothing here calls an LLM. If the index doesn't cover the query well,
the caller sees a low/empty result set and decides what to show --
this layer never invents a passage to fill a gap.
"""
from __future__ import annotations

import json
import os
import pickle

from ..ingestion.models import Chunk
from ..ingestion.pipeline import load_chunks
from ..ingestion.sources import get_source

_INDEX_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "index")

# Process-lifetime caches. bm25.pkl and chunk_manifest.jsonl are only
# written by ingest_corpus.py, which is a separate, deliberate step
# (not something that happens implicitly during a request). Caching
# them avoids reloading/unpickling on every search() call once the AI
# service is used at chat frequency (Module 1B). Trade-off: a
# long-running service process must be restarted after re-running
# ingest_corpus.py for it to see the new index -- acceptable for this
# project's local-dev/single-instance deployment model.
_bm25_cache = None
_chunk_manifest_cache: list[dict] | None = None


def _load_bm25():
    global _bm25_cache
    if _bm25_cache is None:
        path = os.path.join(_INDEX_DIR, "bm25.pkl")
        if not os.path.exists(path):
            raise FileNotFoundError(
                "No index built yet. Run `python scripts/ingest_corpus.py` first."
            )
        with open(path, "rb") as f:
            _bm25_cache = pickle.load(f)
    return _bm25_cache


def _load_chunk_manifest() -> list[dict]:
    global _chunk_manifest_cache
    if _chunk_manifest_cache is None:
        path = os.path.join(_INDEX_DIR, "chunk_manifest.jsonl")
        with open(path, encoding="utf-8") as f:
            _chunk_manifest_cache = [json.loads(line) for line in f if line.strip()]
    return _chunk_manifest_cache


_chunk_cache: dict[str, Chunk] = {}


def _get_chunk(chunk_id: str) -> Chunk:
    if chunk_id not in _chunk_cache:
        source_id, unit_number = chunk_id.split(":", 1)
        for c in load_chunks(source_id):
            _chunk_cache[f"{c.source_id}:{c.unit_number}"] = c
    return _chunk_cache[chunk_id]


def search(query: str, top_k: int = 5, source_id: str | None = None) -> list[dict]:
    """Hybrid-ready lexical search over the corpus. Returns cited results.

    Each result includes the chunk text and a full citation block
    (source, act number, section/article, official URL, verification
    date) -- exactly what CAP's no-hallucination rule requires every
    legal answer to carry.
    """
    bm25 = _load_bm25()
    manifest = _load_chunk_manifest()
    tokenized_query = query.lower().split()
    scores = bm25.get_scores(tokenized_query)

    ranked = sorted(zip(manifest, scores), key=lambda pair: pair[1], reverse=True)
    if source_id:
        ranked = [r for r in ranked if r[0]["source_id"] == source_id]

    results = []
    for row, score in ranked[:top_k]:
        if score <= 0:
            continue
        chunk = _get_chunk(row["chunk_id"])
        source = get_source(chunk.source_id)
        results.append(
            {
                "chunk_id": chunk.chunk_id,
                "score": round(float(score), 4),
                "text": chunk.text,
                "title": chunk.title,
                "citation": chunk.citation(source),
                "coverage_note": source.coverage_note,
            }
        )
    return results


def get_section(source_id: str, unit_number: str) -> dict | None:
    """Direct lookup for the document browser -- no ranking involved."""
    try:
        chunk = _get_chunk(f"{source_id}:{unit_number}")
    except (FileNotFoundError, KeyError):
        return None
    source = get_source(source_id)
    return {
        "chunk_id": chunk.chunk_id,
        "text": chunk.text,
        "title": chunk.title,
        "citation": chunk.citation(source),
        "coverage_note": source.coverage_note,
    }
