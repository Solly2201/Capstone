"""Regression check: none of the fixed, hand-written strings the
legal-answer pipeline can ever return contain a fabricated-action
claim. This is the "runtime check" from the old generative design,
repurposed -- since nothing generates free text anymore, there is
nothing to check per-request, but a future edit to one of these
templates could still introduce the same mistake by hand.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.disclaimer import DISCLAIMER_TEXT  # noqa: E402
from app.generation.pipeline import ABSTENTION_MESSAGE  # noqa: E402
from app.safety.fabrication import contains_fabricated_action_claim  # noqa: E402
from app.safety.risk import (  # noqa: E402
    EMERGENCY_CONTACTS,
    HARMFUL_REQUEST_MESSAGE,
    PERSONALIZED_ADVICE_MESSAGE,
    SERIOUS_MATTER_MESSAGE,
)


def test_abstention_message_has_no_fabricated_action_claim():
    assert contains_fabricated_action_claim(ABSTENTION_MESSAGE) is False


def test_disclaimer_text_has_no_fabricated_action_claim():
    assert contains_fabricated_action_claim(DISCLAIMER_TEXT) is False


def test_personalized_advice_message_has_no_fabricated_action_claim():
    assert contains_fabricated_action_claim(PERSONALIZED_ADVICE_MESSAGE) is False


def test_emergency_contact_messages_have_no_fabricated_action_claim():
    for category, message in EMERGENCY_CONTACTS.items():
        assert contains_fabricated_action_claim(message) is False, category


def test_serious_matter_message_has_no_fabricated_action_claim():
    assert contains_fabricated_action_claim(SERIOUS_MATTER_MESSAGE) is False


def test_harmful_request_message_has_no_fabricated_action_claim():
    assert contains_fabricated_action_claim(HARMFUL_REQUEST_MESSAGE) is False
