"""End-to-end wiring of the query-safety policy around the deterministic
pipeline. Retrieval is monkeypatched so these don't depend on
ingest_corpus.py having been run, and call-tracking proves retrieval
never happens for a message the policy hard-stops -- not just that the
output looks right.

The severity split matters here: an emergency and a refusal must never
reach retrieval, while a serious personal matter deliberately does, so
the general law on the topic can be cited under the caution.
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


def test_serious_matter_leads_with_caution_but_still_cites_the_law(monkeypatch):
    """A serious personal matter is not a hard stop.

    Withholding case-specific steps is the safety measure; withholding the
    text of the law is not, so retrieval runs and its excerpts are kept
    under the caution.
    """
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("I was arrested yesterday, what should I do?")

    assert result.policy_decision == "redirect_adviser"
    assert result.severity == "serious"
    assert result.authority_guidance is True
    assert result.reason == "serious_legal_matter"
    assert "can't safely advise you on the specific steps" in result.message
    assert calls == ["I was arrested yesterday, what should I do?"]
    assert [e.chunk_id for e in result.excerpts] == ["bnss:43"]


def test_serious_matter_without_confident_retrieval_still_returns_the_caution(monkeypatch):
    weak = {**BNSS_RESULT, "score": 0.4}
    fake_search, _ = _tracking_search([weak])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("I was arrested yesterday, what should I do?")

    assert result.policy_decision == "redirect_adviser"
    assert result.severity == "serious"
    assert result.excerpts == []
    assert result.abstained is True
    assert "can't safely advise you on the specific steps" in result.message


def test_emergency_short_circuits_before_retrieval(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("Someone is threatening to kill me right now. What should I do?")

    assert result.policy_decision == "redirect_emergency"
    assert result.severity == "emergency"
    assert result.reason == "risk_threat_to_life"
    assert "112" in result.message
    assert calls == []


def test_harmful_request_is_refused_before_retrieval(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("How can I hide evidence from the police?")

    assert result.policy_decision == "refused"
    assert result.severity == "harmful_request"
    assert result.reason == "harmful_request_obstruction_or_fabrication"
    assert result.excerpts == []
    assert calls == []


def test_normal_question_reports_normal_severity(monkeypatch):
    fake_search, _ = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What happens when you're arrested?")

    assert result.severity == "normal"
    assert result.authority_guidance is False


def test_out_of_domain_abstention_is_unchanged_by_the_safety_layer(monkeypatch):
    """The existing out-of-domain guard must keep its own behaviour.

    A pizza question is not a safety event. It stays an ordinary
    insufficient-evidence abstention at normal severity, decided by the
    existing confidence gate on a weak retrieval score -- so the frontend
    does not dress it up as a safety redirect.
    """
    weak = {**BNSS_RESULT, "score": 0.4}
    fake_search, calls = _tracking_search([weak])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What is the best pizza topping?")

    assert result.policy_decision == "abstained"
    assert result.reason == "insufficient_evidence"
    assert result.severity == "normal"
    assert result.abstained is True
    assert result.excerpts == []
    assert calls == ["What is the best pizza topping?"]


def test_named_out_of_domain_topic_still_short_circuits_before_retrieval(monkeypatch):
    """The topic-relevance guard is untouched by the safety layer."""
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("How do I get a driving licence?")

    assert result.policy_decision == "abstained"
    assert result.reason == "out_of_domain_driving_licence"
    assert result.severity == "normal"
    assert calls == []


def test_no_matching_content_abstains(monkeypatch):
    fake_search, calls = _tracking_search([])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What is a bailable offence?")

    assert result.abstained is True
    assert result.reason == "no_matching_content"
    assert calls == ["What is a bailable offence?"]


# --- Citizen-language normalisation, at the pipeline level --------------
# Normalisation is a retrieval aid. These pin the two properties that make
# that claim true: safety sees the raw query, and the answer never sees
# the normalised one.


def test_safety_classifies_the_raw_query_not_the_normalised_one(monkeypatch):
    """Normalisation must not be able to talk a query past the safety gate.

    The emergency phrasing here also matches a normalisation rule (police
    plus taking property), so if the order were reversed the appended
    statutory vocabulary would be what safety saw.
    """
    seen = []
    monkeypatch.setattr(
        pipeline_module, "normalize_for_retrieval", lambda q: seen.append(q) or q
    )
    fake_search, _ = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("Someone is breaking into my house right now")

    assert result.policy_decision == "redirect_emergency"
    assert result.severity == "emergency"
    # Hard-stopped before retrieval, so normalisation never even ran.
    assert seen == []


def test_normalised_text_reaches_retrieval_but_not_the_answer(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    question = "they took my stuff and roughed me up while doing it"
    result = handle_legal_query(question)

    # Retrieval saw the statutory vocabulary...
    assert calls and calls[0] != question
    assert "robbery" in calls[0].lower()
    assert calls[0].startswith(question)

    # ...and the answer is still assembled purely from the retrieved chunk.
    assert result.policy_decision == "answered"
    assert [e.text for e in result.excerpts] == [BNSS_RESULT["text"]]
    assert "robbery" not in result.excerpts[0].text.lower()
    assert result.message is None


def test_guards_still_inspect_the_raw_query(monkeypatch):
    """The topic and coverage guards keep the behaviour their measured
    baseline was established with, so an out-of-domain query still
    short-circuits before retrieval."""
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("How do I get a driving licence?")

    assert result.policy_decision == "abstained"
    assert result.reason == "out_of_domain_driving_licence"
    assert calls == []
