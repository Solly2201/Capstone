"""Deterministic out-of-domain/topic-relevance guard tests.
No LLM, no ML classifier -- pure pattern matching, run before
retrieval, same "no generation anywhere in this pipeline" standing
decision as app.safety.risk (see docs/PROJECT_STATE.md).
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import app.generation.pipeline as pipeline_module  # noqa: E402
from app.generation.pipeline import handle_legal_query  # noqa: E402
from app.safety.topic_relevance import classify_topic  # noqa: E402

# --- known false positives (the exact failure this guard was built for) ----

KNOWN_FALSE_POSITIVE_EXAMPLES = [
    ("How do I register a company in India?", "company_registration"),
    ("What is the income tax slab?", "income_tax"),
    ("How do I get a driving licence?", "driving_licence"),
]


def test_known_false_positive_queries_are_classified_out_of_domain():
    for text, expected_category in KNOWN_FALSE_POSITIVE_EXAMPLES:
        assert classify_topic(text) == expected_category, text


OTHER_OUT_OF_DOMAIN_EXAMPLES = [
    "best restaurants in mumbai for street food",
    "how to bake a chocolate cake",
    "what is the weather like in delhi today",
    "how do I get a passport",
    "how do I apply for a PAN card",
]


def test_other_clearly_unrelated_queries_are_classified_out_of_domain():
    for text in OTHER_OUT_OF_DOMAIN_EXAMPLES:
        assert classify_topic(text) is not None, text


# --- genuine legal-awareness questions that must keep passing --------------

GENUINE_LEGAL_QUESTIONS = [
    "how do I file an FIR",
    "How do I get bail?",
    "bail for an adult accused of a serious crime",
    "Who has the burden of proof?",
    "burden of proof in a criminal trial",
    "What happens when a child is in conflict with law?",
    "How do I file a consumer complaint?",
    "How do I file an RTI application?",
    "What is a bailable offence?",
    "What does Article 21 of the Constitution say?",
    "right of private defence of body and of property",
    "does everyone get an equal chance at government jobs",
]


def test_genuine_legal_questions_are_not_flagged():
    for text in GENUINE_LEGAL_QUESTIONS:
        assert classify_topic(text) is None, text


# --- ambiguous/near-match queries: guard doesn't fire, existing confidence
# gate is left to abstain on insufficient evidence downstream -------------


AMBIGUOUS_NEAR_MATCH_QUESTIONS = [
    # Shares a single word with an out-of-domain pattern's topic but is
    # phrased as genuine constitutional/statutory language, not the
    # everyday-services phrasing the guard targets.
    "can a state legislature impose a tax on professions and trades",
    "issue of summons to a company under criminal procedure",
]


def test_ambiguous_queries_are_not_pre_emptively_rejected_by_the_guard():
    for text in AMBIGUOUS_NEAR_MATCH_QUESTIONS:
        assert classify_topic(text) is None, text


# --- end-to-end wiring: guard runs before retrieval -------------------------


def test_out_of_domain_query_short_circuits_before_retrieval(monkeypatch):
    calls = []

    def fake_search(query, top_k=5, source_id=None):
        calls.append(query)
        return []

    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What is the income tax slab?")

    assert result.abstained is True
    assert result.policy_decision == "abstained"
    assert result.reason == "out_of_domain_income_tax"
    assert calls == []  # no retrieval call spent on a known-unrelated topic


def test_genuine_legal_query_still_reaches_retrieval(monkeypatch):
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
    calls = []

    def fake_search(query, top_k=5, source_id=None):
        calls.append(query)
        return [BNSS_RESULT]

    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("How do I get bail?")

    assert result.abstained is False
    assert result.policy_decision == "answered"
    assert calls == ["How do I get bail?"]
