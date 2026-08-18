"""Deterministic guard for legal topics this corpus does not contain.

Runs BEFORE retrieval in `app.generation.pipeline.handle_legal_query`,
immediately after `app.safety.topic_relevance`. Rule-based only, by
design -- no ML/LLM classifier, matching this project's standing
decision that the legal-answer pipeline never uses generation and that
gating stays deterministic (see docs/PROJECT_STATE.md).

Why this is a separate guard from `topic_relevance.py`
------------------------------------------------------
`topic_relevance.py` answers "is this a legal question at all?" and
redirects non-legal subjects (income tax filing, driving licences,
recipes) to a government-services portal. This module answers a
different question: "this *is* a legal question, in this service's own
subject area -- but is the Act it asks about actually in the corpus?"
The two need different user-facing messages. Telling someone with a
POCSO question to try india.gov.in would be unhelpful and slightly
insulting; telling them plainly that this service only holds nine
specific India Code sources, and that theirs is not one of them, is
honest and actionable.

The gap this closes
-------------------
The 313-query citizen-language evaluation added an
`insufficient_evidence` category: legal questions about Acts the corpus
genuinely does not contain. Hybrid retrieval abstained correctly on
20/22 non-legal `out_of_domain` queries but on only 5/10 of these,
because a legal question about an un-ingested Act shares real legal
vocabulary with real legal content and therefore lands in the same
dense-score band as a genuine match. A bounded score cannot separate
"the right Act, weakly matched" from "the wrong Act, strongly matched on
shared legal vocabulary" -- the identical reasoning that produced
`topic_relevance.py`, one level harder. Measured failures this guard
exists to fix (each answered confidently from the wrong Act):

| Query | Was answered from | Actually governed by |
| --- | --- | --- |
| "what is the penalty for drunk driving" | `bns:355` (misconduct in public by a drunken person) | Motor Vehicles Act |
| "how do I get a divorce in india" | `bnss:219` (prosecution for offences against marriage) | matrimonial law |
| "what does the law against caste-based atrocities cover" | `constitution:16` (equality of opportunity) | SC/ST (Prevention of Atrocities) Act |
| "what is the punishment under the POCSO act" | `bns:198` (public servant disobeying law) | POCSO |
| "what are the court fees for filing a civil suit" | `bnss:400` (costs in non-cognizable cases) | Court Fees Act / CPC |

Scope discipline
----------------
This is emphatically NOT a list of every Indian Act. It carries one
entry per *demonstrated* evaluation failure, and nothing else. Several
other un-ingested subjects in the same eval category (rent control,
minimum wages, stamp duty, arbitration, labour notice periods) are
deliberately absent: the confidence gate already abstains correctly on
them, so adding patterns would be speculative rather than
evidence-driven. If a future confidence-threshold change turns any of
them into a false answer, add it then -- same "curated dict, extend only
when evaluation names a specific gap" rule as `topic_relevance.py`,
`query_expand.py`'s abbreviation dict, and `chunk.py`'s
`_KNOWN_ARTICLE_TITLES`.

Every pattern below was checked against the actual indexed corpus text
before being added, because several obvious-looking discriminators are
unsafe:

- bare "divorce" appears in `bnss:144`/`bnss:146` (maintenance for a
  divorced woman), `bsa:44` and `jj2015:45` -- all genuinely answerable,
  so only divorce *procedure* phrasings are matched.
- bare "drunk" is the literal subject of `bns:303`'s neighbour
  `bns:355` ("Misconduct in public by a drunken person"), so only
  drunk-*driving* phrasings are matched.
- bare "scheduled caste" appears in `constitution:15`, `constitution:16`,
  `constitution:46` and `lsa:12`, so the SC/ST entry keys off
  "atrocities" (zero occurrences anywhere in the corpus) and the Act's
  own name instead.
- bare "court fee" appears in `lsa:21` (court-fee refund on a Lok Adalat
  award), which is a real answerable question, so only
  filing-cost phrasings are matched.

Known accepted limitations
--------------------------
- POCSO is cited by name inside `bnss:366`, `bnss:397` and `jj2015:2`
  as a cross-reference, so a narrow query like "are POCSO trials held in
  camera" is technically answerable from `bnss:366` and this guard will
  abstain on it anyway. That is the intended trade-off: abstaining on a
  rare answerable phrasing is much cheaper than answering "what is the
  punishment under POCSO" from an unrelated BNS section.
- A query that describes an un-ingested Act's subject *without naming
  it* cannot be caught by a phrase guard at all. The evaluation's own
  `h286` ("how do I file an application for information from a
  government office") is deliberately phrased that way and is a known
  residual -- closing it would need a semantic classifier, which is out
  of scope by standing decision.
"""
from __future__ import annotations

import re

# One category per demonstrated evaluation failure. Phrase-level, never
# bare keywords -- see the module docstring for why each discriminator
# was chosen and which safe-looking alternatives were rejected.
_CATEGORY_PATTERNS: list[tuple[str, list[str]]] = [
    ("pocso", [
        r"\bpocso\b",
        r"\bprotection of children from sexual offences\b",
    ]),
    ("motor_vehicles", [
        r"\bmotor vehicles? act\b",
        r"\bdrunk(en)? driving\b",
        r"\bdrink(ing)? and driv(e|ing)\b",
        r"\bdriving under the influence\b",
        r"\btraffic challan\b",
    ]),
    ("matrimonial", [
        r"\b(get|getting|file|filing|apply for|applying for|obtain|obtaining)\s+(a\s+|an\s+|my\s+)?divorce\b",
        r"\bdivorce\s+(procedure|petition|process|case|proceedings|papers|law)\b",
        r"\bgrounds for divorce\b",
        r"\bmutual consent divorce\b",
        r"\bhindu marriage act\b",
        r"\bspecial marriage act\b",
        r"\bjudicial separation\b",
    ]),
    ("sc_st_atrocities", [
        r"\batrociti(es)?\b",
        r"\bsc\s*/\s*st act\b",
        r"\bscheduled castes and scheduled tribes\s*\(?\s*prevention\b",
    ]),
    ("right_to_information", [
        r"\brti\b",
        r"\bright to information\b",
    ]),
    ("court_fees_civil_procedure", [
        r"\bcourt[- ]fees?\s+(for|to)\b",
        r"\bhow much\b[^?]{0,30}\bcourt[- ]fees?\b",
        r"\bcivil procedure code\b",
        r"\bcode of civil procedure\b",
        r"\bcpc\b",
    ]),
]

_COMPILED = [
    (category, [re.compile(p, re.IGNORECASE) for p in patterns])
    for category, patterns in _CATEGORY_PATTERNS
]

# What the corpus actually holds, stated plainly. Kept in sync with
# app/ingestion's APPROVED_SOURCES by hand -- if a source is added or
# removed, update this string (guarded by
# tests/test_corpus_coverage.py::test_message_lists_every_ingested_source).
NOT_IN_CORPUS_MESSAGE = (
    "This looks like a legal question about a law I don't have. I only "
    "hold verified India Code text for the Constitution, the Bharatiya "
    "Nyaya Sanhita, the Bharatiya Nagarik Suraksha Sanhita, the "
    "Bharatiya Sakshya Adhiniyam, the Consumer Protection Act 2019, the "
    "Juvenile Justice Act 2015, the Information Technology Act, the "
    "Protection of Women from Domestic Violence Act, and the Legal "
    "Services Authorities Act. Rather than quote you a section from the "
    "wrong Act, I'd rather say I can't answer this. You can read the "
    "actual Act at indiacode.nic.in, or contact India's free legal aid "
    "services -- Tele-Law or Nyaya Bandhu."
)


def classify_coverage_gap(text: str) -> str | None:
    """Return the matched un-ingested-subject category, or None.

    None does not mean "covered" -- it means this guard recognizes no
    named out-of-corpus subject, and the query falls through to
    retrieval and the confidence gate exactly as before.
    """
    for category, patterns in _COMPILED:
        if any(p.search(text) for p in patterns):
            return category
    return None
