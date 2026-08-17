"""Retrieval-only search: returns cited passages, never a generated answer.

Three retrieval modes share one output shape (a list of cited result
dicts), so callers -- including app.generation.pipeline -- never need
to know whether a result came from lexical matching, semantic
matching, or their fusion:

  "bm25"   lexical-only (rank_bm25.BM25Okapi over the corpus)
  "dense"  semantic-only (cosine similarity over sentence-transformers
           embeddings, see app/retrieval/embeddings.py)
  "hybrid" both candidate lists combined with Reciprocal Rank Fusion
           (app/retrieval/fusion.py) -- the default when a dense index
           was built, since RRF only ever helps or is neutral versus
           either method alone (see docs/RETRIEVAL_EVALUATION.md for
           the measured comparison, not just this claim in prose)

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
from . import embeddings as dense_embeddings
from .fusion import DEFAULT_BM25_WEIGHT, DEFAULT_DENSE_WEIGHT, DEFAULT_RRF_K, reciprocal_rank_fusion
from .tokenize import tokenize

_INDEX_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "index")

# How many top candidates each individual method contributes to fusion.
# RRF's contribution per item decays as 1/(k+rank), so with k=60 a rank
# past ~50 barely moves the fused score -- capping here keeps fusion
# O(candidates) instead of O(corpus) without changing which chunks can
# plausibly reach the final top_k.
_FUSION_CANDIDATE_POOL = 50

# Process-lifetime caches. bm25.pkl / dense_vectors.npy / chunk_manifest.jsonl
# are only written by ingest_corpus.py, which is a separate, deliberate step
# (not something that happens implicitly during a request). Caching them
# avoids reloading/unpickling on every search() call once the AI service is
# used at chat frequency (Module 1B). Trade-off: a long-running service
# process must be restarted after re-running ingest_corpus.py for it to see
# the new index -- acceptable for this project's local-dev/single-instance
# deployment model.
_bm25_cache = None
_chunk_manifest_cache: list[dict] | None = None
_dense_cache = None  # False once probed-and-absent, ndarray once loaded
_index_manifest_cache: dict | None = None


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


def _load_index_manifest() -> dict:
    global _index_manifest_cache
    if _index_manifest_cache is None:
        path = os.path.join(_INDEX_DIR, "index_manifest.json")
        with open(path, encoding="utf-8") as f:
            _index_manifest_cache = json.load(f)
    return _index_manifest_cache


def _load_dense():
    """Returns the (n_chunks, dim) normalized embedding matrix, or None
    if no dense index was built (optional dependency not installed at
    index-build time, or index predates dense support)."""
    global _dense_cache
    if _dense_cache is None:
        path = os.path.join(_INDEX_DIR, "dense_vectors.npy")
        manifest = _load_index_manifest()
        if not os.path.exists(path) or manifest.get("mode") != "hybrid":
            _dense_cache = False
        else:
            import numpy as np

            _dense_cache = np.load(path)
    return _dense_cache if _dense_cache is not False else None


def dense_index_available() -> bool:
    return _load_dense() is not None


_chunk_cache: dict[str, Chunk] = {}


def _get_chunk(chunk_id: str) -> Chunk:
    if chunk_id not in _chunk_cache:
        source_id, unit_number = chunk_id.split(":", 1)
        for c in load_chunks(source_id):
            _chunk_cache[f"{c.source_id}:{c.unit_number}"] = c
    return _chunk_cache[chunk_id]


def _default_mode() -> str:
    configured = os.environ.get("RETRIEVAL_MODE")
    if configured in ("bm25", "dense", "hybrid"):
        return configured
    return "hybrid" if dense_index_available() else "bm25"


def _bm25_scores(query: str) -> dict[str, float]:
    bm25 = _load_bm25()
    manifest = _load_chunk_manifest()
    tokenized_query = tokenize(query)
    scores = bm25.get_scores(tokenized_query)
    return {row["chunk_id"]: float(score) for row, score in zip(manifest, scores)}


def _dense_scores(query: str) -> dict[str, float]:
    vectors = _load_dense()
    if vectors is None:
        return {}
    manifest = _load_chunk_manifest()
    query_vec = dense_embeddings.embed_query(query, name=_load_index_manifest().get("dense_embedding_model"))
    sims = vectors @ query_vec
    return {row["chunk_id"]: float(sim) for row, sim in zip(manifest, sims)}


def _ranked_ids(scores: dict[str, float], limit: int | None = None, positive_only: bool = False) -> list[str]:
    items = sorted(scores.items(), key=lambda pair: pair[1], reverse=True)
    if positive_only:
        items = [item for item in items if item[1] > 0]
    if limit is not None:
        items = items[:limit]
    return [chunk_id for chunk_id, _ in items]


def search(
    query: str,
    top_k: int = 5,
    source_id: str | None = None,
    mode: str | None = None,
) -> list[dict]:
    """Search the corpus. Returns cited results, most relevant first.

    Each result includes the chunk text and a full citation block
    (source, act number, section/article, official URL, verification
    date) -- exactly what CAP's no-hallucination rule requires every
    legal answer to carry. Alongside the primary "score" used by the
    confidence gate, every result also carries its raw per-method
    score/rank (bm25_score, bm25_rank, dense_score, dense_rank) so
    fusion behavior can be inspected/evaluated without re-querying.

    mode: "bm25" | "dense" | "hybrid" | None (auto -- hybrid if a dense
    index was built at ingest time, else bm25).
    """
    resolved_mode = mode or _default_mode()
    if resolved_mode == "dense" and not dense_index_available():
        resolved_mode = "bm25"

    bm25_scores = _bm25_scores(query) if resolved_mode in ("bm25", "hybrid") else {}
    dense_scores = _dense_scores(query) if resolved_mode in ("dense", "hybrid") else {}

    bm25_rank_list = _ranked_ids(bm25_scores, limit=_FUSION_CANDIDATE_POOL, positive_only=True)
    dense_rank_list = _ranked_ids(dense_scores, limit=_FUSION_CANDIDATE_POOL)
    bm25_ranks = {cid: i + 1 for i, cid in enumerate(bm25_rank_list)}
    dense_ranks = {cid: i + 1 for i, cid in enumerate(dense_rank_list)}

    if resolved_mode == "bm25":
        ranked_chunk_ids = _ranked_ids(bm25_scores, positive_only=True)
        primary_scores = bm25_scores
    elif resolved_mode == "dense":
        ranked_chunk_ids = _ranked_ids(dense_scores)
        primary_scores = dense_scores
    else:  # hybrid
        fused = reciprocal_rank_fusion(
            [bm25_rank_list, dense_rank_list],
            k=int(os.environ.get("RRF_K", DEFAULT_RRF_K)),
            weights=[
                float(os.environ.get("RRF_BM25_WEIGHT", DEFAULT_BM25_WEIGHT)),
                float(os.environ.get("RRF_DENSE_WEIGHT", DEFAULT_DENSE_WEIGHT)),
            ],
        )
        ranked_chunk_ids = sorted(fused, key=lambda cid: fused[cid], reverse=True)
        primary_scores = fused

    manifest_by_id = {row["chunk_id"]: row for row in _load_chunk_manifest()}
    if source_id:
        ranked_chunk_ids = [cid for cid in ranked_chunk_ids if manifest_by_id[cid]["source_id"] == source_id]

    results = []
    for chunk_id in ranked_chunk_ids[:top_k]:
        chunk = _get_chunk(chunk_id)
        source = get_source(chunk.source_id)
        results.append(
            {
                "chunk_id": chunk.chunk_id,
                "score": round(float(primary_scores[chunk_id]), 6),
                "text": chunk.text,
                "title": chunk.title,
                "citation": chunk.citation(source),
                "coverage_note": source.coverage_note,
                "retrieval_mode": resolved_mode,
                "bm25_score": round(bm25_scores[chunk_id], 4) if chunk_id in bm25_scores else None,
                "bm25_rank": bm25_ranks.get(chunk_id),
                "dense_score": round(dense_scores[chunk_id], 4) if chunk_id in dense_scores else None,
                "dense_rank": dense_ranks.get(chunk_id),
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
