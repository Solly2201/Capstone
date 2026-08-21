"""Deterministic citizen-language normalisation tests.

Three things are being protected here:

1. The mappings still fire on the citizen phrasings that justified them.
2. Genuinely ambiguous phrasings are still left alone, because guessing
   would steer confidently toward one wrong statute.
3. Normalisation stays a retrieval aid -- it runs after safety, and it
   never reaches the answer.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.query.normalize import (  # noqa: E402
    MAX_EXPANSIONS,
    normalization_terms,
    normalize_for_retrieval,
    rule_summary,
)

# --- 1. Citizen phrasing reaches statutory vocabulary -------------------
# Each case is a real query from eval/queries_human.jsonl, paired with a
# distinctive word of the statutory vocabulary it must acquire.
CITIZEN_MAPPINGS = [
    ("they took my stuff and roughed me up while doing it", "robbery"),
    ("a man threatened to burn my shop if I didn't pay him", "extortion"),
    ("someone smashed the windows of my car for no reason", "mischief"),
    ("someone made a fake rent agreement with my signature on it", "forgery"),
    ("I got beaten up badly by a group of people last night", "grievous"),
    ("someone is spreading lies about me and ruining my name", "defamation"),
    ("can they just barge into my house without any paper", "search-warrant"),
    ("the cops want to search my phone, can they just take it", "seize"),
    ("cops won't register my complaint, what do I do", "cognizable"),
    ("I heard you can get bail even before they arrest you", "apprehending"),
    ("is an admission obtained through pressure usable against the accused", "confession"),
    ("who is allowed to give evidence", "testify"),
    ("does digital stuff count as a document", "electronic"),
    ("is an online platform responsible for content uploaded by its users", "intermediary"),
    ("what is a charge sheet", "completion of investigation"),
]


@pytest.mark.parametrize("query,expected_vocabulary", CITIZEN_MAPPINGS)
def test_citizen_phrasing_gains_statutory_vocabulary(query, expected_vocabulary):
    assert expected_vocabulary in normalize_for_retrieval(query).lower(), query


# --- 2. Context-gated rules: special statutes ---------------------------
# These exist because the wrong-Act failures are general-concept queries
# whose answer lives in a special statute. Each must fire only when its
# discriminating signal is present.
CONTEXT_GATED = [
    ("what happens to a 10 year old who steals something", "conflict with law"),
    ("will I get bail if the cyber charge is a three year offence", "bailable"),
    ("the court told him to stay away but he came back anyway", "breach of protection order"),
    ("a man pretended to be a police officer and took money from me", "public servant"),
]


@pytest.mark.parametrize("query,expected_vocabulary", CONTEXT_GATED)
def test_special_statute_rules_fire_on_their_signal(query, expected_vocabulary):
    assert expected_vocabulary in normalize_for_retrieval(query).lower(), query


def test_child_rule_does_not_fire_without_a_child_signal():
    """Without an age/child signal this is ordinary BNS theft, not the JJ Act."""
    assert "conflict with law" not in normalize_for_retrieval("someone stole my bag").lower()


def test_cyber_bail_rule_does_not_fire_on_ordinary_bail():
    assert "bailable" not in normalize_for_retrieval("how do I apply for bail").lower()


# --- 3. Ambiguity is preserved -----------------------------------------
# The evaluation set contains phrasings that genuinely map to more than
# one provision. Normalising them would push retrieval confidently toward
# one wrong Act, so no rule may fire.
AMBIGUOUS = [
    "I want to file a complaint",             # BNSS / consumer / civic
    "which court should I go to",             # criminal court or Commission
    "what is my case status",                 # any of the above
]


@pytest.mark.parametrize("query", AMBIGUOUS)
def test_ambiguous_phrasing_is_left_alone(query):
    assert normalization_terms(query) == [], query
    assert normalize_for_retrieval(query) == query


def test_taking_ambiguity_resolves_on_the_subject_not_the_verb():
    """M7 left "someone took my phone" entirely unexpanded because taking
    can be theft or a lawful police seizure. M12 narrowed that: the
    hand-verified eval label (h016 -> bns:303) says a *named non-police
    subject* taking property is a theft question, and the measured cost of
    the blanket stand-down was the query sitting outside both retrieval
    pools. The genuine ambiguity -- the police doing the taking -- is
    still preserved, and this pins both directions.
    """
    assert "theft" in normalize_for_retrieval("someone took my phone, what can I do").lower()
    for police_phrasing in (
        "police took my phone",
        "the police seized my phone during a search",
        "cops took my phone at the station",
    ):
        assert "theft" not in normalize_for_retrieval(police_phrasing).lower(), police_phrasing


# --- 4. Queries that must pass through untouched ------------------------
UNTOUCHED = [
    "What is bail?",
    "What is an FIR?",
    "What are fundamental rights?",
    "What is the difference between cognizable and non-cognizable offences?",
    "What is the best pizza topping?",
    "",
]


@pytest.mark.parametrize("query", UNTOUCHED)
def test_clean_and_out_of_domain_queries_are_unchanged(query):
    assert normalize_for_retrieval(query) == query, query


# --- 5. Structural guarantees ------------------------------------------

def test_raw_query_is_always_preserved_in_full():
    """Normalisation appends; it never substitutes or drops the original."""
    for query, _ in CITIZEN_MAPPINGS:
        assert normalize_for_retrieval(query).startswith(query), query


def test_expansions_are_capped():
    """Measured: appended vocabulary helps at one or two additions and
    hurts as it accumulates, so the cap is a correctness control."""
    busy = (
        "the cops took my phone and smashed my car window and threatened to burn my shop "
        "if I didn't pay and spread lies about my name and beat me up badly"
    )
    assert len(normalization_terms(busy)) <= MAX_EXPANSIONS


def test_no_duplicate_expansions():
    for query, _ in CITIZEN_MAPPINGS:
        terms = normalization_terms(query)
        assert len(terms) == len(set(terms)), query


def test_normalisation_is_idempotent():
    """Re-normalising already-normalised text adds nothing new."""
    for query, _ in CITIZEN_MAPPINGS:
        once = normalize_for_retrieval(query)
        assert normalize_for_retrieval(once) == once, query


def test_every_rule_declares_evidence_and_confidence():
    for rule in rule_summary():
        assert rule["confidence"] in {"HIGH", "MEDIUM", "CONTEXT-GATED"}, rule
        assert rule["evidence"].strip(), rule
