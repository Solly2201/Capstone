"""Deterministic Risk/UPL rules for Module 1B.

Runs BEFORE retrieval (see app.generation.pipeline.handle_legal_query).
Rule-based only, by design -- no ML classifier, and the legal-answer
pipeline never uses a generative LLM at all (standing project decision,
see docs/PROJECT_STATE.md). Contact
routes below are fixed configuration data, not model-generated text,
matching docs/LEGAL_SOURCES.md's "Safety redirect sources" table.

This is a v1 heuristic keyword/phrase ruleset, not an exhaustive
safety classifier. It is deliberately conservative (curated phrases)
rather than attempting broad NLU-based risk detection, which would
require an ML/LLM component that is explicitly out of scope for v1.
"""
from __future__ import annotations

import re

# Checked in this order; the first category whose pattern matches wins.
# Higher-urgency personal-safety categories are checked before the
# lower-urgency personalized-advice category.
_CATEGORY_PATTERNS: list[tuple[str, list[str]]] = [
    ("self_harm", [
        r"\bkill myself\b",
        r"\bsuicid\w*\b",
        r"\bend my life\b",
        r"\bwant to die\b",
        r"\bhurt myself\b",
        r"\bself[- ]harm\b",
    ]),
    ("child_safety", [
        r"\bchild (is |being )?(being )?abus\w*\b",
        r"\bchild in danger\b",
        r"\bminor (is )?being abused\b",
        r"\bchild traffick\w*\b",
    ]),
    ("domestic_violence", [
        r"\b(husband|wife|partner|spouse) (hits|is hitting|beats|is beating|abuses|is abusing) me\b",
        r"\bdomestic violence\b",
        r"\bbeing abused at home\b",
        r"\bspousal abuse\b",
    ]),
    ("medical_emergency", [
        r"\bheart attack\b",
        r"\bnot breathing\b",
        r"\boverdose\b",
        r"\bsevere bleeding\b",
        r"\bmedical emergency\b",
        r"\bunconscious\b",
    ]),
    ("active_crime", [
        r"\bwitnessing a crime\b",
        r"\brobbery happening\b",
        r"\bbeing attacked\b",
        r"\bshooting (right now|happening)\b",
        r"\bmurder happening\b",
        r"\bhow (do|to) i (make a bomb|hide a body|hide a dead body)\b",
        r"\bhow to (hack|break) into (someone|an account|a system)\b",
        r"\bhow (do|can) i get away with\b",
    ]),
    ("cyber_fraud", [
        r"\bbank account was hacked\b",
        r"\blost money to (an? )?online fraud\b",
        r"\bupi fraud\b",
        r"\botp scam\b",
        r"\bphishing\b",
        r"\bstole money from my account\b",
    ]),
    ("personalized_advice", [
        r"\bi (was|got|have been) arrested\b",
        r"\bpolice arrested me\b",
        r"\bmy (fir|case|complaint)\b",
        r"\bshould i plead guilty\b",
        r"\bwill i go to jail\b",
        r"\bwhat happens to my case\b",
        r"\bam i going to (jail|prison)\b",
        r"\bi am being investigated\b",
        r"\bi('| ha)ve been (charged|accused)\b",
    ]),
]

_COMPILED = [
    (category, [re.compile(p, re.IGNORECASE) for p in patterns])
    for category, patterns in _CATEGORY_PATTERNS
]

# Categories that hard-stop with an emergency/official-contact redirect.
EMERGENCY_CATEGORIES = {
    "self_harm",
    "child_safety",
    "domestic_violence",
    "medical_emergency",
    "active_crime",
    "cyber_fraud",
}


def classify_risk(text: str) -> str | None:
    """Return the matched risk category, or None if the text looks like
    a general informational legal question."""
    for category, patterns in _COMPILED:
        if any(p.search(text) for p in patterns):
            return category
    return None


EMERGENCY_CONTACTS: dict[str, str] = {
    "self_harm": (
        "This sounds like it may be a personal safety concern, not a legal "
        "information question, so I can't continue as a legal information "
        "chatbot for this message. If you are in danger or thinking about "
        "harming yourself, please contact 112 (Emergency) right away, or "
        "reach out to someone you trust immediately."
    ),
    "child_safety": (
        "This describes a possible child-safety concern, not a legal "
        "information question. Please contact 112 (Emergency) immediately."
    ),
    "domestic_violence": (
        "This describes a possible safety concern, not a legal information "
        "question. Please contact 112 (Emergency) or the Women's Helpline "
        "at 181 for immediate support."
    ),
    "medical_emergency": (
        "This sounds like a medical emergency, not a legal information "
        "question. Please call 112 (Emergency) immediately."
    ),
    "active_crime": (
        "I can't help with this request. If this describes an active crime "
        "or someone in immediate danger, please contact 112 (Emergency) "
        "right away."
    ),
    "cyber_fraud": (
        "This describes a possible cybercrime or financial fraud. Please "
        "call 1930 (Cyber Fraud Helpline) or report it at the National "
        "Cyber Crime Reporting Portal (cybercrime.gov.in)."
    ),
}

PERSONALIZED_ADVICE_MESSAGE = (
    "This looks like it's about your own specific situation rather than "
    "general legal information, and I'm not able to give personal legal "
    "advice or predict what will happen in your case. Please contact a "
    "qualified legal adviser, or India's free legal aid services -- "
    "Tele-Law or Nyaya Bandhu -- for guidance on your situation."
)
