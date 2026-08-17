"""Deterministic out-of-domain/topic-relevance guard for Module 1B.

Runs BEFORE retrieval (see app.generation.pipeline.handle_legal_query),
same placement as app.safety.risk's Risk/UPL check. Rule-based only, by
design -- no ML/LLM classifier, matching this project's standing
decision that the legal-answer pipeline never uses generation and that
Risk/UPL-style gating stays deterministic (see docs/PROJECT_STATE.md).

Why this exists: stress-testing the hybrid confidence gate
(docs/RETRIEVAL_EVALUATION.md, DEFAULT_MIN_SCORE_BY_MODE's docstring)
found that a single dense-score threshold cannot separate every
out-of-domain query from genuine coverage gaps. Queries like "What is
the income tax slab?" and "How do I get a driving licence?" score
0.44-0.49 -- inside the range of genuine low-confidence legal
paraphrases (e.g. eval q20 at 0.4531) -- because they share real
vocabulary with unrelated corpus content (Constitution articles on
state taxation power mention "tax on income"; the IT Act's digital
certificate provisions mention "licence"). Raising the score threshold
further would cost that genuine query without closing the gap for
these -- a shared vocabulary word from a different real-world topic
looks identical to a genuinely low-confidence match on a single
bounded score.

This guard instead matches the query's *topic* against a small, curated
set of well-known non-legal-information subjects an Indian citizen
commonly asks about that this corpus was never meant to cover (tax
filing, motor-vehicle licensing, company/business registration,
identity documents, and everyday non-civic topics like weather or
food) -- independent of vocabulary overlap with any single chunk. It
is deliberately narrow, the same "curated dict, extend only when
evaluation names a specific gap" pattern as
app/retrieval/query_expand.py's abbreviation dict and
app/ingestion/chunk.py's _KNOWN_ARTICLE_TITLES: it catches known,
demonstrated false positives and other clearly-unrelated everyday
topics, not a general topic classifier. Anything it doesn't recognize
still falls through to the existing per-mode confidence gate
unchanged, and the safe default when relevance is uncertain remains
abstention, not this guard trying to be exhaustive.

Patterns are phrase-level (multi-word), not bare keywords, specifically
so they don't collide with genuine legal content that happens to share
a single word -- e.g. "income tax" (a specific phrase) is matched, but
bare "tax" is not, so a genuine constitutional-taxation-power query
(which uses "tax on income", not "income tax") is untouched.
"""
from __future__ import annotations

import re

_CATEGORY_PATTERNS: list[tuple[str, list[str]]] = [
    ("company_registration", [
        r"\bregister(ing)?\s+(a|my|an)?\s*(new\s+)?(company|business|startup|llp)\b",
        r"\bcompany registration\b",
        r"\bincorporat\w*\s+(a|my)?\s*company\b",
        r"\bstartup registration\b",
    ]),
    ("income_tax", [
        r"\bincome tax\b",
        r"\btax slab\b",
        r"\bfile\s+(my\s+|an?\s+)?tax\s+return\b",
        r"\bgst registration\b",
        r"\bitr filing\b",
    ]),
    ("driving_licence", [
        r"\bdriving licen[cs]e\b",
        r"\blearner('|s)?s? licen[cs]e\b",
        r"\b(rto|regional transport office)\b",
        r"\bvehicle registration\b",
    ]),
    ("identity_documents", [
        r"\bpassport\b",
        r"\baadhaar\b",
        r"\bpan card\b",
        r"\bration card\b",
        r"\bvoter id\b",
        r"\bbirth certificate\b",
    ]),
    ("everyday_nonlegal", [
        r"\bweather\b",
        r"\brecipe\b",
        r"\bcooking\b",
        r"\b(bake|baking)\b",
        r"\brestaurant\b",
        r"\bstreet food\b",
        r"\bmovie\b",
        r"\bcricket score\b",
        r"\bflight ticket\b",
        r"\btrain ticket\b",
        r"\bhotel booking\b",
        r"\bjob vacanc\w*\b",
        r"\bexam result\w*\b",
    ]),
]

_COMPILED = [
    (category, [re.compile(p, re.IGNORECASE) for p in patterns])
    for category, patterns in _CATEGORY_PATTERNS
]

OUT_OF_DOMAIN_MESSAGE = (
    "This looks like it's about a topic this legal-information service "
    "doesn't cover -- I only have verified India Code legal text, not "
    "general government-services or everyday information. Please try a "
    "government services portal (e.g. india.gov.in) for this instead."
)


def classify_topic(text: str) -> str | None:
    """Return the matched out-of-domain category, or None if the query
    doesn't match a known unrelated topic (it may still be genuinely
    uncovered -- that's the confidence gate's job downstream, not this
    guard's)."""
    for category, patterns in _COMPILED:
        if any(p.search(text) for p in patterns):
            return category
    return None
