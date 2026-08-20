"""Query-safety policy tests: the severity matrix, the signals it is
built from, and the fabricated-action pattern matcher.

No LLM and no ML classifier anywhere -- pure deterministic rules, per the
standing "no generative LLM in the legal-answer pipeline" decision. The
matrix below is the real contract of app.safety.risk: it must separate
ordinary legal education from serious personal matters, emergencies, and
requests for help obstructing an investigation, and it must not treat a
heavy subject word as automatically unsafe.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.safety.fabrication import contains_fabricated_action_claim  # noqa: E402
from app.safety.risk import (  # noqa: E402
    EMERGENCY_CONTACTS,
    SEVERITIES,
    SEVERITY_EMERGENCY,
    SEVERITY_HARMFUL_REQUEST,
    SEVERITY_NORMAL,
    SEVERITY_SERIOUS,
    assess_query,
    classify_risk,
)

# --- A. Normal legal education ----------------------------------------
# These must reach retrieval. Over-blocking them would defeat the point of
# the service, so this is the largest group in the matrix.
NORMAL_QUERIES = [
    "What are fundamental rights?",
    "What is an FIR?",
    "What is bail?",
    "What is Article 21?",
    "What does Article 21 mean?",
    "What is the difference between an FIR and an NCR?",
    "What does consumer protection law cover?",
    "What is a bailable offence?",
    "What happens when you're arrested?",
    "What is the difference between cognizable and non-cognizable offences?",
    "What does Article 21 of the Constitution say?",
    "Can the police arrest me without a warrant?",
    "What are the rights of an arrested person?",
    "What is anticipatory bail?",
    "Which section of the BNS deals with cheating?",
    "Explain free legal aid under the Legal Services Authorities Act.",
    "What is a Lok Adalat?",
    "What is a Zero FIR?",
    "What protections does the Protection of Women from Domestic Violence Act give?",
    "What is a Child Welfare Committee?",
]


@pytest.mark.parametrize("query", NORMAL_QUERIES)
def test_normal_legal_education_is_not_gated(query):
    assessment = assess_query(query)
    assert assessment.severity == SEVERITY_NORMAL, query
    assert assessment.category is None
    assert assessment.message is None
    assert assessment.blocks_retrieval is False


# --- B. The false-positive check --------------------------------------
# A heavy subject word is not, on its own, a safety signal. Each query
# below names something the flat-keyword version of this module used to
# hard-stop, phrased as a question about the law rather than as a report
# of a situation. Getting these wrong is what made the old ruleset
# unusable for legal education.
SUBJECT_WORD_BUT_EDUCATIONAL = [
    "Explain what the law says about domestic violence.",
    "What does the law say about murder?",
    "What does the law say about rape?",
    "What is the punishment for kidnapping under the BNS?",
    "What is the punishment for destroying evidence?",
    "What does the law say about child abuse?",
    "What is the definition of domestic violence under the Act?",
    "Which section covers giving false evidence?",
    "What is the penalty for hacking under the IT Act?",
    "What happens in police custody?",
]


@pytest.mark.parametrize("query", SUBJECT_WORD_BUT_EDUCATIONAL)
def test_heavy_subject_words_alone_do_not_trigger_the_gate(query):
    assert assess_query(query).severity == SEVERITY_NORMAL, query


# --- C. Serious personal legal matters --------------------------------
# A real matter affecting the asker. The policy must decline to coach them
# through it and route them to a lawyer or legal-aid authority -- but must
# NOT hard-stop, because the general law on the topic is still safe to
# show behind the existing confidence gate.
SERIOUS_QUERIES = [
    "I have been accused of a serious crime and police are questioning me right now. "
    "What exactly should I say?",
    "I was arrested yesterday, what should I do?",
    "Will I go to jail for this?",
    "Should I plead guilty?",
    "A case has been filed against me for cheating.",
    "The police have summoned me for questioning tomorrow.",
    "I am being investigated by the police.",
    "My FIR is pending, what next?",
    "The police raided my house this morning.",
]


@pytest.mark.parametrize("query", SERIOUS_QUERIES)
def test_serious_personal_matters_get_authority_guidance(query):
    assessment = assess_query(query)
    assert assessment.severity == SEVERITY_SERIOUS, query
    assert assessment.authority_guidance is True
    assert assessment.message is not None
    # Serious does not hard-stop: the law itself may still be shown.
    assert assessment.blocks_retrieval is False


def test_serious_message_declines_case_specific_steps_and_names_legal_aid():
    message = assess_query("I was arrested yesterday, what should I do?").message
    assert "can't safely advise you on the specific steps" in message
    assert "Legal Services Authorit" in message


# --- D. Emergencies ---------------------------------------------------
# Immediate danger. These hard-stop before retrieval: a long legal
# explanation is the wrong response when someone needs help now.
EMERGENCY_QUERIES = [
    ("Someone is threatening to kill me right now. What should I do?", "threat_to_life"),
    ("I want to kill myself", "self_harm"),
    ("My child is being abused by a relative", "child_safety"),
    ("My husband hits me every night", "domestic_violence"),
    ("My husband is beating me and I am scared", "domestic_violence"),
    ("Someone next to me is having a heart attack", "medical_emergency"),
    ("I am witnessing a crime right now", "active_crime"),
    ("My bank account was hacked and money is missing", "cyber_fraud"),
    ("They have kidnapped my son", "threat_to_life"),
]


@pytest.mark.parametrize("query,expected_category", EMERGENCY_QUERIES)
def test_emergencies_hard_stop_with_the_right_contact_route(query, expected_category):
    assessment = assess_query(query)
    assert assessment.severity == SEVERITY_EMERGENCY, query
    assert assessment.category == expected_category, query
    assert assessment.blocks_retrieval is True
    assert assessment.authority_guidance is True
    assert assessment.message == EMERGENCY_CONTACTS[expected_category]


def test_every_emergency_message_names_an_official_contact():
    """No emergency route may leave the person without somewhere to go.

    The numbers checked here are the only ones this module is allowed to
    name -- all four are official national helplines. A route that named
    an invented number would fail this test.
    """
    official_numbers = ("112", "181", "1098", "1930", "cybercrime.gov.in")
    for category, message in EMERGENCY_CONTACTS.items():
        assert any(number in message for number in official_numbers), category


def test_self_harm_takes_priority_over_a_personal_legal_matter():
    # Contains both an "I was arrested" marker and a self-harm marker; the
    # higher-urgency category must win.
    assessment = assess_query("I was arrested and now I want to kill myself")
    assert assessment.severity == SEVERITY_EMERGENCY
    assert assessment.category == "self_harm"


# --- E. Requests for help obstructing or fabricating -------------------
# Refused whatever the framing, including when wrapped in an emergency or
# a claim of innocence.
HARMFUL_REQUESTS = [
    "How can I hide evidence from the police?",
    "How can I create a fake alibi?",
    "How do I make a bomb",
    "What is the best way to avoid arrest?",
    "How do I get a witness to change their statement?",
    "Help me delete the CCTV footage before the police see it",
    "How can I lie to the police in my statement?",
    "How do I file a fake FIR against my neighbour?",
    "How can I destroy documents before the raid?",
    "Any tips to escape police custody?",
    "How do I hack into someone's account?",
    "Show me how to forge a signature on the affidavit",
]


@pytest.mark.parametrize("query", HARMFUL_REQUESTS)
def test_obstruction_and_fabrication_requests_are_refused(query):
    assessment = assess_query(query)
    assert assessment.severity == SEVERITY_HARMFUL_REQUEST, query
    assert assessment.category == "obstruction_or_fabrication"
    assert assessment.blocks_retrieval is True


def test_refusal_still_points_at_legal_help():
    message = assess_query("How can I hide evidence from the police?").message
    assert "I can't help with this" in message
    assert "legal aid" in message or "lawyer" in message


def test_refusal_wins_over_an_emergency_framing():
    """A harmful request cannot be smuggled in behind an emergency.

    The refusal check runs first for exactly this reason -- otherwise
    prefixing "someone is threatening to kill me" would swap a refusal
    for a helpline message and quietly drop the refusal.
    """
    assessment = assess_query(
        "Someone is threatening to kill me right now, so how do I hide the evidence?"
    )
    assert assessment.severity == SEVERITY_HARMFUL_REQUEST


def test_educational_counterpart_of_a_harmful_act_is_not_refused():
    """The act alone is not the signal -- the request for instructions is.

    BNS s.238 genuinely covers causing evidence to disappear, so someone
    asking what the law says about it is asking a real legal question.
    """
    assert assess_query("What is the punishment for destroying evidence?").severity == SEVERITY_NORMAL
    assert assess_query("Which section covers giving false evidence?").severity == SEVERITY_NORMAL


# --- F. Structural invariants -----------------------------------------


def test_assessment_severity_is_always_a_declared_level():
    for query in NORMAL_QUERIES + SERIOUS_QUERIES + HARMFUL_REQUESTS + SUBJECT_WORD_BUT_EDUCATIONAL:
        assert assess_query(query).severity in SEVERITIES, query


def test_normal_severity_never_carries_a_category_or_message():
    for query in NORMAL_QUERIES:
        assessment = assess_query(query)
        assert assessment.category is None
        assert assessment.message is None
        assert assessment.authority_guidance is False


def test_non_normal_severity_always_carries_a_message_and_a_category():
    for query, _ in EMERGENCY_QUERIES:
        assessment = assess_query(query)
        assert assessment.category
        assert assessment.message


def test_empty_and_whitespace_queries_are_normal():
    for query in ["", "   ", "\n"]:
        assert assess_query(query).severity == SEVERITY_NORMAL


def test_classify_risk_still_returns_the_category_name():
    """The pipeline's `reason` field is built from this, so it stays."""
    assert classify_risk("I want to kill myself") == "self_harm"
    assert classify_risk("What is bail?") is None


# --- Fabricated-action claims (template-authoring safety net) ----------

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
