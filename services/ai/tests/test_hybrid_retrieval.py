"""Hybrid/dense retrieval: real index, real embeddings, real corpus.

Skips automatically if sentence-transformers isn't installed in this
environment (requirements-full.txt is optional -- see
docs/RETRIEVAL_EVALUATION.md), matching the project's existing
graceful-degradation policy for the dense layer.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.ingestion.index_build import build_index  # noqa: E402
from app.ingestion.pipeline import ingest_all  # noqa: E402
from app.retrieval import embeddings as dense_embeddings  # noqa: E402

requires_dense = pytest.mark.skipif(
    not dense_embeddings.is_available(), reason="sentence-transformers not installed"
)


def setup_module():
    ingest_all()
    build_index()


@requires_dense
def test_index_manifest_reports_hybrid_mode():
    import json

    from app.retrieval.search import _INDEX_DIR

    with open(os.path.join(_INDEX_DIR, "index_manifest.json"), encoding="utf-8") as f:
        manifest = json.load(f)
    assert manifest["mode"] == "hybrid"
    assert manifest["dense_embedding_model"] == dense_embeddings.model_name()
    assert manifest["dense_embedding_dim"] == 384


@requires_dense
def test_hybrid_is_the_auto_default_when_dense_index_exists():
    from app.retrieval.search import search

    results = search("right of private defence of body and of property", top_k=3)
    assert results
    assert results[0]["retrieval_mode"] == "hybrid"


@requires_dense
def test_hybrid_results_carry_per_method_debug_scores():
    from app.retrieval.search import search

    results = search("estoppel", top_k=5, mode="hybrid")
    assert results
    for r in results:
        # Every hybrid result must expose enough to audit the fusion
        # decision -- at minimum a dense_score, since dense scores are
        # computed for the whole corpus every hybrid query.
        assert r["dense_score"] is not None
        assert -1.0 <= r["dense_score"] <= 1.0


@requires_dense
def test_dense_mode_never_returns_generated_text():
    from app.ingestion.pipeline import load_all_chunks
    from app.retrieval.search import search

    known_ids = {c.chunk_id for c in load_all_chunks()}
    for r in search("what happens when someone is arrested", top_k=5, mode="dense"):
        assert r["chunk_id"] in known_ids
        assert r["retrieval_mode"] == "dense"


@requires_dense
def test_bm25_mode_ignores_dense_index_even_when_available():
    from app.retrieval.search import search

    results = search("estoppel", top_k=3, mode="bm25")
    assert results
    for r in results:
        assert r["retrieval_mode"] == "bm25"
        assert r["dense_score"] is None
        assert r["dense_rank"] is None


def test_bm25_mode_works_without_dense_index(monkeypatch):
    """bm25 mode must stay fully functional even when no dense index was
    built -- this is the graceful-degradation path Module 1A shipped
    with, and hybrid must not break it."""
    import app.retrieval.search as search_module

    monkeypatch.setattr(search_module, "_load_dense", lambda: None)
    results = search_module.search("estoppel", top_k=3, mode="bm25")
    assert results
    assert results[0]["retrieval_mode"] == "bm25"


def test_requesting_dense_mode_falls_back_to_bm25_when_unavailable(monkeypatch):
    import app.retrieval.search as search_module

    monkeypatch.setattr(search_module, "dense_index_available", lambda: False)
    results = search_module.search("estoppel", top_k=3, mode="dense")
    assert results
    assert results[0]["retrieval_mode"] == "bm25"
