"""Fabricated-action pattern matcher -- a template-authoring safety net.

CAP must never claim to have taken a real-world action it hasn't
actually performed -- no fake "I contacted the police", no fake "I
filed your complaint". This is a standing product-integrity rule for
the whole project (see CLAUDE_CODE_HANDOFF.md), not specific to any one
module.

The legal-answer pipeline (app.generation.pipeline) never generates
free text -- every response is either a verbatim retrieved excerpt or
one of the fixed, hand-written strings in app.safety.risk / the
disclaimer module -- so there is no per-request output left to check
at runtime. This function is kept as a cheap regression check
(services/ai/tests/test_template_safety.py) run against those fixed
strings, so a future edit to a hand-written template can't silently
reintroduce a fabricated-action claim.
"""
from __future__ import annotations

import re

_FABRICATION_PATTERNS = [
    r"\bi(' ?ve| have)? (already )?(contacted|called|notified|alerted) (the )?(police|authorities|emergency services)\b",
    r"\bi(' ?ve| have)? (already )?(filed|submitted|registered) (your |the )?(fir|complaint|report)\b",
    r"\byour (fir|complaint|report) has been (filed|submitted|registered)\b",
    r"\bi(' ?ve| have)? (already )?(called|dialed) 112\b",
    r"\bi have taken action on your behalf\b",
    r"\bconsider it (done|handled|taken care of)\b",
]

_COMPILED = [re.compile(p, re.IGNORECASE) for p in _FABRICATION_PATTERNS]


def contains_fabricated_action_claim(text: str) -> bool:
    return any(p.search(text) for p in _COMPILED)
