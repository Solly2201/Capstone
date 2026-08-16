"""FastAPI /legal/answer endpoint integration tests. Retrieval is
monkeypatched (as in test_legal_query.py) so these don't depend on
ingest_corpus.py having been run. No provider/generation involved
anywhere -- deterministic retrieval only.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient  # noqa: E402

import app.generation.pipeline as pipeline_module  # noqa: E402
from app.main import app as fastapi_app  # noqa: E402

client = TestClient(fastapi_app)

BNSS_RESULT = {
    "chunk_id": "bnss:43",
    "score": 15.39,
    "text": "No woman shall be arrested after sunset and before sunrise.",
    "title": "",
    "citation": {
        "source": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "act_no": "ACT NO. 46 OF 2023",
        "unit": "Section 43",
        "official_url": "https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf",
        "verified_as_on": "6th October, 2025",
    },
    "coverage_note": "PARTIAL",
}


def _stub_search(results):
    def fake_search(query, top_k=5, source_id=None):
        return results

    return fake_search


def test_health_reports_legal_answer_capability():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert "legal-answer" in resp.json()["enabled_capabilities"]


def test_answer_returns_verbatim_excerpt_with_citation_and_disclaimer(monkeypatch):
    monkeypatch.setattr(pipeline_module, "_search", _stub_search([BNSS_RESULT]))

    resp = client.post("/legal/answer", json={"question": "What happens when you're arrested?"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["policy_decision"] == "answered"
    assert body["abstained"] is False
    assert len(body["excerpts"]) == 1
    assert body["excerpts"][0]["text"] == BNSS_RESULT["text"]
    assert body["excerpts"][0]["unit"] == "Section 43"
    assert body["disclaimer_version"] == "2026-08-16"
    assert "public awareness" in body["disclaimer_text"]


def test_question_too_short_returns_422():
    resp = client.post("/legal/answer", json={"question": "a"})
    assert resp.status_code == 422


def test_missing_question_returns_422():
    resp = client.post("/legal/answer", json={})
    assert resp.status_code == 422


def test_risky_question_short_circuits_before_retrieval(monkeypatch):
    calls = []
    monkeypatch.setattr(
        pipeline_module, "_search", lambda q, top_k=5, source_id=None: calls.append(q) or [BNSS_RESULT]
    )

    resp = client.post("/legal/answer", json={"question": "I want to kill myself"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["policy_decision"] == "redirect_emergency"
    assert "112" in body["message"]
    assert calls == []


def test_returns_503_when_index_not_built(monkeypatch):
    def raise_not_found(query, top_k=5, source_id=None):
        raise FileNotFoundError("No index built yet.")

    monkeypatch.setattr(pipeline_module, "_search", raise_not_found)

    resp = client.post("/legal/answer", json={"question": "What is a bailable offence?"})

    assert resp.status_code == 503


def test_no_matching_content_abstains(monkeypatch):
    monkeypatch.setattr(pipeline_module, "_search", _stub_search([]))

    resp = client.post("/legal/answer", json={"question": "What is a bailable offence?"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["abstained"] is True
    assert body["reason"] == "no_matching_content"
    assert body["excerpts"] == []
