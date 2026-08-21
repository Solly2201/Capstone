"""Deterministic multi-turn context: follow-up detection, safe
composition, clarification instead of guessing, and the guarantee that
client-supplied context can never carry retrieval past a safety guard.
Retrieval is monkeypatched throughout; nothing here depends on a built
index.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import app.generation.pipeline as pipeline_module  # noqa: E402
from app.generation.pipeline import handle_legal_query  # noqa: E402
from app.query.context import (  # noqa: E402
    ConversationContext,
    is_follow_up,
    resolve_context,
)

EVAL_DIR = os.path.join(os.path.dirname(__file__), "..", "eval")

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

ARREST_CONTEXT = ConversationContext(previous_question="Can the police arrest me without a warrant?")


def _tracking_search(results):
    calls = []

    def fake_search(query, top_k=5, source_id=None):
        calls.append(query)
        return results

    return fake_search, calls


# --- follow-up detection ----------------------------------------------------


def test_dependent_openers_are_follow_ups():
    for text in (
        "What if I am a minor?",
        "what about at night?",
        "And if the police refuse?",
        "in that case can I appeal?",
        "but what if I already confessed?",
        "even if they have a warrant?",
    ):
        assert is_follow_up(text), text


def test_bare_anaphora_is_a_follow_up():
    for text in ("what about this?", "and then?", "is that so?", "what about that", "then what?"):
        assert is_follow_up(text), text


def test_full_questions_stand_alone():
    for text in (
        "Can the police arrest me without a warrant?",
        "What is the punishment for theft?",
        "How do I file an FIR against a police officer?",
        "What is bail and how does it work?",
        "my landlord will not return my deposit, what are my rights",
    ):
        assert not is_follow_up(text), text


# --- resolution -------------------------------------------------------------


def test_standalone_question_ignores_context_entirely():
    resolution = resolve_context("What is the punishment for theft?", ARREST_CONTEXT)
    assert resolution.context_applied is False
    assert resolution.needs_clarification is False
    assert resolution.retrieval_question == "What is the punishment for theft?"


def test_follow_up_with_content_is_composed_not_interpreted():
    resolution = resolve_context("What if I am a minor?", ARREST_CONTEXT)
    assert resolution.context_applied is True
    # Pure concatenation: both texts present verbatim, nothing invented.
    assert ARREST_CONTEXT.previous_question in resolution.retrieval_question
    assert "What if I am a minor?" in resolution.retrieval_question


def test_follow_up_without_context_needs_clarification():
    resolution = resolve_context("What if I am a minor?", None)
    assert resolution.needs_clarification is True
    assert resolution.context_applied is False


def test_contentless_follow_up_needs_clarification_even_with_context():
    for text in ("what about this?", "and then?", "then what?"):
        resolution = resolve_context(text, ARREST_CONTEXT)
        assert resolution.needs_clarification is True, text


# --- pipeline wiring --------------------------------------------------------


def test_follow_up_retrieves_on_the_combined_text(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What if I am a minor?", context=ARREST_CONTEXT)

    assert result.policy_decision == "answered"
    assert result.context_applied is True
    assert ARREST_CONTEXT.previous_question in result.resolved_question
    assert len(calls) == 1
    assert ARREST_CONTEXT.previous_question in calls[0]
    assert "minor" in calls[0].lower()


def test_follow_up_without_context_asks_for_a_full_question(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What if I am a minor?")

    assert result.policy_decision == "abstained"
    assert result.reason == "needs_context"
    assert calls == []


def test_standalone_question_is_never_dragged_back_to_the_old_topic(monkeypatch):
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    result = handle_legal_query("What is the punishment for theft?", context=ARREST_CONTEXT)

    assert result.context_applied is False
    assert result.resolved_question is None
    assert calls == ["What is the punishment for theft?"]


def test_context_cannot_carry_retrieval_past_the_coverage_guard(monkeypatch):
    """First turn about divorce is refused by the coverage guard; the same
    subject must not become answerable through an innocuous follow-up."""
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    divorce = ConversationContext(previous_question="How do I get a divorce in India?")
    result = handle_legal_query("What if my wife agrees?", context=divorce)

    assert result.abstained is True
    assert result.reason is not None and result.reason.startswith("not_in_corpus_")
    assert calls == []


def test_context_cannot_smuggle_a_harmful_request(monkeypatch):
    """The combined text is re-assessed by the risk policy: a harmful
    request split across two turns is still refused before retrieval."""
    fake_search, calls = _tracking_search([BNSS_RESULT])
    monkeypatch.setattr(pipeline_module, "_search", fake_search)

    harmful = ConversationContext(previous_question="How can I hide evidence from the police?")
    result = handle_legal_query("what about at night?", context=harmful)

    assert result.policy_decision == "refused"
    assert calls == []


def test_multi_turn_normalize_rules_never_fire_on_single_turn_eval_queries():
    """The two [\\s\\S]-window rules added for multi-turn composition
    (breach-of-protection-order, consumer limitation) must stay inert for
    every single-turn query in both eval sets -- their measured baselines
    depend on it. The patterns are matched directly (local copies kept in
    sync with app/query/normalize.py) because the single-turn h209 rule
    legitimately appends the same breach expansion for its own phrasing."""
    import re

    breach = re.compile(
        r"\bprotection order\b[\s\S]{0,80}\b(break\w*|broke|breach\w*|violat\w*|disobey\w*|ignor\w*)\b"
        r"|\b(break\w*|broke|breach\w*|violat\w*|disobey\w*)\b[\s\S]{0,40}\bprotection order\b",
        re.IGNORECASE,
    )
    limitation = re.compile(
        r"\b(consumer complaint|consumer court|consumer commission|defective|refund|money back|product liability)\b"
        r"[\s\S]{0,120}\b(years? ago|time limit|too late|deadline|last year|two years|2 years)\b"
        r"|\b(years? ago|too late|time limit)\b[\s\S]{0,60}\b(consumer complaint|defective|refund)\b",
        re.IGNORECASE,
    )

    for name in ("queries.jsonl", "queries_human.jsonl"):
        path = os.path.join(EVAL_DIR, name)
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                row = json.loads(line)
                assert not breach.search(row["query"]), f"{name}: breach rule fired on {row['query']!r}"
                assert not limitation.search(row["query"]), f"{name}: limitation rule fired on {row['query']!r}"


def test_no_eval_query_is_misread_as_a_follow_up():
    """Over-blocking guard: no genuine (non-abstain) query in either eval
    set may be classified follow-up-shaped, or the context layer would
    turn answerable single-turn questions into clarification requests."""
    for name in ("queries.jsonl", "queries_human.jsonl"):
        path = os.path.join(EVAL_DIR, name)
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                row = json.loads(line)
                if row.get("expect_abstain"):
                    continue
                assert not is_follow_up(row["query"]), f"{name}: {row['query']!r}"
