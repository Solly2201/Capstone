"""Deterministic Risk/UPL and fabricated-action pattern-matcher tests.
No LLM, no ML classifier -- pure pattern matching, per the standing
"no generative LLM in the legal-answer pipeline" decision."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.safety.fabrication import contains_fabricated_action_claim  # noqa: E402
from app.safety.risk import classify_risk  # noqa: E402

# --- Risk/UPL categories ----------------------------------------------------

RISKY_EXAMPLES = [
    ("I want to kill myself", "self_harm"),
    ("My child is being abused by a relative", "child_safety"),
    ("My husband hits me every night", "domestic_violence"),
    ("Someone next to me is having a heart attack", "medical_emergency"),
    ("I am witnessing a crime right now", "active_crime"),
    ("How do I make a bomb", "active_crime"),
    ("My bank account was hacked and money is missing", "cyber_fraud"),
    ("I was arrested yesterday, what should I do?", "personalized_advice"),
    ("Will I go to jail for this?", "personalized_advice"),
]


def test_risky_examples_classified_correctly():
    for text, expected_category in RISKY_EXAMPLES:
        assert classify_risk(text) == expected_category, text


SAFE_INFORMATIONAL_EXAMPLES = [
    "What is a bailable offence?",
    "What happens when you're arrested?",
    "What is the difference between cognizable and non-cognizable offences?",
    "What does Article 21 of the Constitution say?",
    "What is an FIR?",
]


def test_safe_informational_questions_are_not_flagged():
    for text in SAFE_INFORMATIONAL_EXAMPLES:
        assert classify_risk(text) is None, text


def test_self_harm_takes_priority_over_personalized_advice():
    # Contains both an "I was arrested" style marker and a self-harm marker;
    # the higher-urgency category must win.
    text = "I was arrested and now I want to kill myself"
    assert classify_risk(text) == "self_harm"


# --- Fabricated-action claims (template-authoring safety net) --------------

FABRICATION_EXAMPLES = [
    "I have contacted the police on your behalf.",
    "I've already filed your complaint with the local station.",
    "Your FIR has been submitted successfully.",
    "I have called 112 for you.",
    "Consider it handled.",
]


def test_fabrication_examples_are_detected():
    for text in FABRICATION_EXAMPLES:
        assert contains_fabricated_action_claim(text) is True, text


def test_grounded_informational_text_is_not_flagged_as_fabrication():
    text = "Women cannot generally be arrested after sunset or before sunrise."
    assert contains_fabricated_action_claim(text) is False
