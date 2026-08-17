"""Build the retrieval index over ingested chunks.

BM25 (lexical) is always built -- it's cheap, has no heavy ML
dependency, and is a strong baseline for statute text where citizens
often search using the law's own vocabulary ("cognizable", "bail
bond"). Dense embeddings (sentence-transformers, see
app/retrieval/embeddings.py) are built too when that dependency is
installed; if it isn't, indexing degrades to BM25-only rather than
failing, and index_manifest.json records which mode was used so the
retrieval layer and the docs never overstate what's live.

Index format on disk (services/ai/data/index/, rebuilt entirely by
build_index() -- never hand-edited):
  bm25.pkl             pickled rank_bm25.BM25Okapi over tokenized chunk text
  dense_vectors.npy    float32 array, shape (n_chunks, embedding_dim),
                       L2-normalized, row order == chunk_manifest.jsonl order
  chunk_manifest.jsonl one row per chunk: chunk_id, source_id, unit_number, title
  index_manifest.json  chunk_count, embedding model name + dimension, mode

Swapping the embedding model later means setting DENSE_EMBEDDING_MODEL
(see app/retrieval/embeddings.py) and re-running
`python scripts/ingest_corpus.py` -- nothing else in the pipeline needs
to change, since dimension is read back from the model itself.
"""
from __future__ import annotations

import json
import os
import pickle

from rank_bm25 import BM25Okapi

from ..retrieval import embeddings as dense_embeddings
from ..retrieval.tokenize import tokenize
from .models import Chunk
from .pipeline import load_all_chunks

_INDEX_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "index")


def _index_text(chunk: Chunk) -> str:
    """Text actually matched against at search time.

    The section/article *title* ("Estoppel", "Right of private defence
    of body and of property") is exactly the vocabulary a citizen is
    most likely to search with, but chunk.text is the body only (the
    chunker deliberately keeps the title out of the displayed excerpt
    body -- see chunk.py). Concatenating the title in here for indexing
    only (never for what's returned/displayed) measurably fixed several
    exact-title queries during evaluation that otherwise missed their
    obviously-correct section because the title word never appeared in
    the body text at all (e.g. "estoppel" the word doesn't recur inside
    BSA s.121's body). This never changes what's shown to a user --
    Excerpt.text always stays the verbatim chunk.text.
    """
    return f"{chunk.title}. {chunk.text}" if chunk.title else chunk.text


def _try_build_dense(chunks: list[Chunk]) -> tuple[str | None, int | None, object | None]:
    if not dense_embeddings.is_available():
        return None, None, None
    try:
        vectors = dense_embeddings.embed_texts([_index_text(c) for c in chunks])
        return dense_embeddings.model_name(), int(vectors.shape[1]), vectors
    except Exception:
        # Missing weights, no network, etc. -- fall back to lexical-only
        # rather than take down ingestion over an optional dense layer.
        return None, None, None


def build_index() -> dict:
    chunks = load_all_chunks()
    if not chunks:
        raise ValueError("No chunks to index -- run ingest_all() first.")

    os.makedirs(_INDEX_DIR, exist_ok=True)

    tokenized = [tokenize(_index_text(c)) for c in chunks]
    bm25 = BM25Okapi(tokenized)
    with open(os.path.join(_INDEX_DIR, "bm25.pkl"), "wb") as f:
        pickle.dump(bm25, f)

    embedding_model, embedding_dim, dense_vectors = _try_build_dense(chunks)
    if dense_vectors is not None:
        import numpy as np

        np.save(os.path.join(_INDEX_DIR, "dense_vectors.npy"), dense_vectors)
    else:
        # Stale vectors from a previous run (built when the optional
        # dependency was installed) must not silently keep being used
        # once it's uninstalled -- the manifest's "mode" is the single
        # source of truth for what's live, never file presence alone.
        stale = os.path.join(_INDEX_DIR, "dense_vectors.npy")
        if os.path.exists(stale):
            os.remove(stale)

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
        "dense_embedding_dim": embedding_dim,
        "mode": "hybrid" if embedding_model else "lexical-only",
    }
    with open(os.path.join(_INDEX_DIR, "index_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    return manifest
