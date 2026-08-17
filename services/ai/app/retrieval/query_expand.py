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

A second, equally narrow mechanism below (`_CONCEPT_PHRASES`) applies
the same append-only pattern to whole citizen-phrasing patterns rather
than single abbreviations. It exists for the same reason and under the
same discipline: added only when the eval harness demonstrates a real
retrieval failure, not proactively. Its one entry so far
("police question[ed] me" -> "interrogation") was added after
eval/queries.jsonl's q15 ("can my lawyer be present when police
question me") failed to retrieve its target chunk (BNSS s.38, titled
"Right of arrested person to meet an advocate of his choice during
interrogation") anywhere in the top-20 results -- the query and the
section title share almost no vocabulary ("lawyer"/"advocate",
"police question"/"interrogation") despite describing the exact same
right. Checked against search() directly: appending "interrogation"
alone (the single term measured to matter) moves BNSS s.38 from
outside the top-20 to rank 1; scanned against every other query in
eval/queries.jsonl to confirm the trigger phrase doesn't fire on any
of them (q15 is the only match). Do not add another entry here unless
a future evaluation failure names one -- this is not a place to grow a
general synonym dictionary (see docs/RETRIEVAL_EVALUATION.md's "Query
preprocessing" sections for the standing reasoning).
"""
from __future__ import annotations

import re

_ABBREVIATIONS: dict[str, str] = {
    "FIR": "First Information Report",
    "NCR": "Non-Cognizable Report",
}

_WORD_BOUNDARY = {abbr: re.compile(rf"\b{re.escape(abbr)}\b") for abbr in _ABBREVIATIONS}

_CONCEPT_PHRASES: list[tuple[re.Pattern, str]] = [
    (
        re.compile(r"\bpolice\b[^.?!]*\bquestion|\bquestion\w*\b[^.?!]*\bpolice\b", re.IGNORECASE),
        "interrogation",
    ),
]


def expand_query(query: str) -> str:
    """Append spelled-out abbreviations and known citizen-phrasing
    concept terms found in query."""
    additions = [
        expansion
        for abbr, expansion in _ABBREVIATIONS.items()
        if _WORD_BOUNDARY[abbr].search(query) and expansion.lower() not in query.lower()
    ]
    additions += [
        expansion
        for pattern, expansion in _CONCEPT_PHRASES
        if pattern.search(query) and expansion.lower() not in query.lower()
    ]
    if not additions:
        return query
    return query + " " + " ".join(additions)
