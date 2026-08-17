"""Minimal, curated query-time abbreviation expansion.

docs/RETRIEVAL_EVALUATION.md's "Query preprocessing: deferred" section
set an explicit trigger condition for revisiting that decision: only if
future evaluation exposes a failure specifically attributable to an
abbreviation. eval/queries.jsonl's q23 ("how do I file an FIR") does
exactly that -- "FIR" is the term nearly every Indian citizen actually
uses, but it appears almost nowhere in BNSS's own statutory text
(section 173, "Information in cognizable cases", never uses the
abbreviation), so neither BM25 nor dense retrieval can bridge that gap
from a bare index.

This is intentionally narrow: a fixed dict of well-established Indian
legal abbreviations (matching the ones already used in CAP's own
learning articles), expanded by *appending* the spelled-out form so
the original query tokens are preserved -- never a general synonym
model, never touching indexed/stored text, never per-corpus-learned.
"""
from __future__ import annotations

import re

_ABBREVIATIONS: dict[str, str] = {
    "FIR": "First Information Report",
    "NCR": "Non-Cognizable Report",
}

_WORD_BOUNDARY = {abbr: re.compile(rf"\b{re.escape(abbr)}\b") for abbr in _ABBREVIATIONS}


def expand_query(query: str) -> str:
    """Append spelled-out forms of known abbreviations found in query."""
    additions = [
        expansion
        for abbr, expansion in _ABBREVIATIONS.items()
        if _WORD_BOUNDARY[abbr].search(query) and expansion.lower() not in query.lower()
    ]
    if not additions:
        return query
    return query + " " + " ".join(additions)
