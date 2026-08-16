import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient  # noqa: E402

from app.ingestion.index_build import build_index  # noqa: E402
from app.ingestion.pipeline import ingest_all  # noqa: E402
from app.main import app  # noqa: E402


def setup_module():
    ingest_all()
    build_index()


def test_search_finds_arrest_provision_for_sunset_query():
    from app.retrieval.search import search

    results = search("woman arrested sunset", top_k=3)
    assert results
    assert results[0]["citation"]["unit"] == "Section 43"
    assert results[0]["citation"]["source"] == "Bharatiya Nagarik Suraksha Sanhita, 2023"


def test_search_never_returns_generated_text():
    """Every result must be traceable to an ingested chunk_id -- this
    layer must never synthesize a passage."""
    from app.retrieval.search import search
    from app.ingestion.pipeline import load_all_chunks

    known_ids = {c.chunk_id for c in load_all_chunks()}
    for r in search("bail", top_k=5):
        assert r["chunk_id"] in known_ids


def test_api_list_sources():
    client = TestClient(app)
    resp = client.get("/corpus/sources")
    assert resp.status_code == 200
    ids = {s["source_id"] for s in resp.json()}
    assert ids == {"constitution", "bns", "bnss", "bsa"}


def test_api_search_requires_min_query_length():
    client = TestClient(app)
    resp = client.get("/corpus/search", params={"q": "a"})
    assert resp.status_code == 422


def test_api_get_section_404_for_uningested_section():
    client = TestClient(app)
    # Section 478 (bail) is explicitly not yet ingested -- coverage_note says so.
    resp = client.get("/corpus/sections/bnss/478")
    assert resp.status_code == 404


def test_api_get_section_200_for_known_article():
    client = TestClient(app)
    resp = client.get("/corpus/sections/constitution/21")
    assert resp.status_code == 200
    assert resp.json()["citation"]["unit"] == "Article 21"
