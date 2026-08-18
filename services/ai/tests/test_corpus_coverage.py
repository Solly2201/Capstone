"""Corpus-coverage guard tests: legal questions about un-ingested Acts.

Deterministic pattern matching only -- no LLM, no ML classifier, run
before retrieval, same standing decision as app.safety.risk and
app.safety.topic_relevance (see docs/PROJECT_STATE.md).

This guard is the narrow fix for a measured failure class: the 313-query
citizen-language evaluation found hybrid retrieval answering 5 of 10
`insufficient_evidence` queries confidently from the wrong Act, because a
legal question about an Act the corpus lacks shares real legal
vocabulary with real legal content and clears the dense-score floor.
The tests below lock in both halves of that fix -- it must catch the
demonstrated failures, and it must not block anything the corpus can
actually answer.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.pipeline import handle_legal_query  # noqa: E402
from app.safety.corpus_coverage import (  # noqa: E402
    NOT_IN_CORPUS_MESSAGE,
    classify_coverage_gap,
)

EVAL_DIR = os.path.join(os.path.dirname(__file__), "..", "eval")

# --- the exact evaluation failures this guard was built for ---------------
# Each of these was answered confidently from the wrong Act before the
# guard existed; the comment records what it wrongly cited.

MEASURED_WRONG_ACT_FAILURES = [
    ("what is the penalty for drunk driving", "motor_vehicles"),        # was bns:355
    ("how do I get a divorce in india", "matrimonial"),                 # was bnss:219
    ("what does the law against caste-based atrocities cover", "sc_st_atrocities"),  # was constitution:16
    ("what is the punishment under the POCSO act", "pocso"),            # was bns:198
    ("what are the court fees for filing a civil suit", "court_fees_civil_procedure"),  # was bnss:400
]


def test_measured_wrong_act_failures_are_now_caught():
    for text, expected_category in MEASURED_WRONG_ACT_FAILURES:
        assert classify_coverage_gap(text) == expected_category, text


def test_measured_wrong_act_failures_abstain_end_to_end():
    """The guard must actually change pipeline behavior, not just
    classify -- and it must abstain rather than redirect, since these
    are real legal questions, not emergencies or personal-advice asks."""
    for text, expected_category in MEASURED_WRONG_ACT_FAILURES:
        answer = handle_legal_query(text)
        assert answer.abstained is True, text
        assert answer.policy_decision == "abstained", text
        assert answer.reason == f"not_in_corpus_{expected_category}", text
        assert answer.message == NOT_IN_CORPUS_MESSAGE, text
        assert answer.excerpts == [], text


def test_rti_is_caught_by_name():
    """RTI is the one source registered but never ingested (the supplied
    PDF has an unresolved font-encoding defect), so it is a permanent
    coverage gap rather than a scoping decision."""
    assert classify_coverage_gap("How do I file an RTI application?") == "right_to_information"
    assert classify_coverage_gap("what does the right to information act say") == "right_to_information"


# --- must NOT block anything the corpus genuinely answers -----------------
# Every probe below is a near-miss on one of the guard's own patterns and
# maps to real ingested text. These are the cases that made the obvious
# discriminators ("divorce", "drunk", "scheduled caste", "court fee")
# unsafe to match bare -- see app/safety/corpus_coverage.py's docstring.

ANSWERABLE_NEAR_MISSES = [
    # bnss:144 / bnss:146 -- maintenance for a woman who has been divorced
    "can a divorced woman claim maintenance from her husband",
    "what does the law say about a divorced wife's allowance",
    # bns:355 -- misconduct in public by a drunken person
    "punishment for misconduct in public by a drunken person",
    # bns:281 -- rash driving IS in the corpus; only drunk driving is not
    "what is rash driving on a public way",
    # constitution:15 / constitution:16 / lsa:12 -- Scheduled Castes
    "does the constitution prohibit discrimination on grounds of caste",
    "who qualifies for legal services if they are from a scheduled caste",
    # lsa:21 -- court-fee refund on a Lok Adalat award
    "is the court fee refunded when a case is settled in a lok adalat",
    # bsa:126 / bsa:3 -- civil proceedings
    "are husband and wife competent witnesses in civil cases",
    "what evidence is relevant in civil proceedings",
    # bns:63-71 / jj2015 -- child sexual offences ARE partly covered
    "what is the punishment for a sexual offence against a child",
    "what happens to a child in conflict with law",
    # bns:82 -- bigamy, adjacent to but not matrimonial procedure
    "punishment for marrying again during the lifetime of a spouse",
]


def test_answerable_near_misses_are_not_blocked():
    for text in ANSWERABLE_NEAR_MISSES:
        assert classify_coverage_gap(text) is None, text


def test_guard_never_fires_on_a_query_that_expects_an_answer():
    """Scanned across BOTH labelled eval sets (362 query groups). A single
    fire on an expect_abstain=False row is over-blocking and a recall
    regression, so this is asserted rather than spot-checked."""
    over_blocked = []
    for name in ("queries.jsonl", "queries_human.jsonl"):
        path = os.path.join(EVAL_DIR, name)
        with open(path, encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                row = json.loads(line)
                if row["expect_abstain"]:
                    continue
                if classify_coverage_gap(row["query"]) is not None:
                    over_blocked.append((name, row["id"], row["query"]))
    assert over_blocked == [], f"guard over-blocks answerable queries: {over_blocked}"


def test_guard_falls_through_silently_for_unrecognized_subjects():
    """None means 'no named out-of-corpus subject recognized', NOT
    'covered' -- those queries still go to retrieval and the confidence
    gate. Several un-ingested subjects are deliberately absent from the
    pattern list because the score gate already abstains on them."""
    for text in ("how much stamp duty do I pay to register a sale deed",
                 "what is the minimum wage for a construction worker",
                 "can my landlord increase the rent whenever he wants"):
        assert classify_coverage_gap(text) is None, text


INGESTED_SOURCE_NAMES = [
    "Constitution",
    "Bharatiya Nyaya Sanhita",
    "Bharatiya Nagarik Suraksha Sanhita",
    "Bharatiya Sakshya Adhiniyam",
    "Consumer Protection Act 2019",
    "Juvenile Justice Act 2015",
    "Information Technology Act",
    "Protection of Women from Domestic Violence Act",
    "Legal Services Authorities Act",
]


def test_message_lists_every_ingested_source():
    """The abstention message tells the user exactly what this service
    does hold. If a source is ever added or removed from ingestion, this
    fails and forces the message to be updated rather than silently
    going stale."""
    for name in INGESTED_SOURCE_NAMES:
        assert name in NOT_IN_CORPUS_MESSAGE, name
    assert "indiacode.nic.in" in NOT_IN_CORPUS_MESSAGE


def test_message_does_not_name_the_act_governing_the_question():
    """Anti-fabrication: the guard says what this service lacks, it never
    asserts which Act actually governs the user's question. Stating that
    would be an unsourced legal claim, which is exactly what this
    project's no-generation stance exists to prevent."""
    for act in ("Motor Vehicles Act", "Hindu Marriage Act", "POCSO",
                "Prevention of Atrocities", "Court Fees Act"):
        assert act not in NOT_IN_CORPUS_MESSAGE, act
