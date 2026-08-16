"""End-to-end wiring of Risk/UPL around the deterministic pipeline.
Retrieval is monkeypatched so these don't depend on ingest_corpus.py
having been run, and call-tracking proves retrieval never happens for
a message Risk/UPL catches -- not just that the output looks right.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import app.generation.pipeline as pipeline_module  # noqa: E402
from app.generation.pipeline import handle_legal_query  # noqa: E402

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


def _tracking_search(results):
    calls = []

    def fake_search(query, top_k=5, source_id=None):
        calls.append(query)
        return results

    return fake_search, calls


def test_safe_question_proceeds_through_retrieval_to_a_deterministic_answer(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What happens when you're arrested?")

    assert result.policy_decision == "answered"
    assert result.abstained is False
    assert len(result.excerpts) == 1
    assert result.excerpts[0].text == BNSS_RESULT["text"]
    assert calls == ["What happens when you're arrested?"]


def test_risky_question_short_circuits_before_retrieval(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("I want to kill myself")

    assert result.policy_decision == "redirect_emergency"
    assert result.reason == "risk_self_harm"
    assert "112" in result.message
    assert calls == []


def test_personalized_advice_short_circuits_before_retrieval(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("I was arrested yesterday, what should I do?")

    assert result.policy_decision == "redirect_adviser"
    assert result.reason == "risk_personalized_advice"
    assert "Tele-Law" in result.message or "Nyaya Bandhu" in result.message
    assert calls == []


def test_no_matching_content_abstains(monkeypatch):
    fake_search, calls = _tracking_search([])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What is a bailable offence?")

    assert result.abstained is True
    assert result.reason == "no_matching_content"
    assert calls == ["What is a bailable offence?"]
