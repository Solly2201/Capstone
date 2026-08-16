"""Build the retrieval index over ingested chunks.

BM25 (lexical) is always built -- it's cheap, has no heavy ML
dependency, and is a strong baseline for statute text where citizens
often search using the law's own vocabulary ("cognizable", "bail
bond"). Dense embeddings (sentence-transformers) are built too when
that dependency is installed; if it isn't, indexing degrades to
BM25-only rather than failing, and the manifest records which mode was
used so the retrieval layer and the docs never overstate what's live.

Swapping the embedding model later means changing EMBEDDING_MODEL_NAME
and re-running this -- nothing else in the pipeline needs to change.
"""
from __future__ import annotations

import json
import os
import pickle

from rank_bm25 import BM25Okapi

from .models import Chunk
from .pipeline import load_all_chunks

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_INDEX_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "index")


def _tokenize(text: str) -> list[str]:
    return text.lower().split()


def _try_build_dense(chunks: list[Chunk]) -> tuple[str | None, object | None]:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        return None, None
    try:
        import numpy as np

        model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        embeddings = model.encode([c.text for c in chunks], show_progress_bar=False)
        return EMBEDDING_MODEL_NAME, np.asarray(embeddings, dtype="float32")
    except Exception:
        # Missing weights, no network, etc. -- fall back to lexical-only
        # rather than take down ingestion over an optional dense layer.
        return None, None


def build_index() -> dict:
    chunks = load_all_chunks()
    if not chunks:
        raise ValueError("No chunks to index -- run ingest_all() first.")

    os.makedirs(_INDEX_DIR, exist_ok=True)

    tokenized = [_tokenize(c.text) for c in chunks]
    bm25 = BM25Okapi(tokenized)
    with open(os.path.join(_INDEX_DIR, "bm25.pkl"), "wb") as f:
        pickle.dump(bm25, f)

    embedding_model, dense_vectors = _try_build_dense(chunks)
    if dense_vectors is not None:
        import numpy as np

        np.save(os.path.join(_INDEX_DIR, "dense_vectors.npy"), dense_vectors)

    manifest_rows = [
        {"chunk_id": c.chunk_id, "source_id": c.source_id, "unit_number": c.unit_number, "title": c.title}
        for c in chunks
    ]
    with open(os.path.join(_INDEX_DIR, "chunk_manifest.jsonl"), "w", encoding="utf-8") as f:
        for row in manifest_rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    manifest = {
        "chunk_count": len(chunks),
        "dense_embedding_model": embedding_model,  # None means BM25-only mode
        "mode": "hybrid" if embedding_model else "lexical-only",
    }
    with open(os.path.join(_INDEX_DIR, "index_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    return manifest
