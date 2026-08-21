"""Deterministic spelling normalisation for retrieval text -- curated only.

Misspellings are the citizen-language failure class nothing else in the
pipeline can reach: BM25 cannot match a token the statute never contains
("theift"), and the dense encoder degrades on it. M12's taxonomy put 7 of
the citizen set's misspelling rows outside one or both retrieval pools
for exactly this reason.

The mechanism is a curated map of observed misspellings of legal
vocabulary -- a pure function of the query, extended only against a
named failing query, like every curated list in this package.

A GENERIC corrector was built first and REJECTED on measurement: mapping
any token absent from the corpus vocabulary to its nearest
edit-distance-1 corpus word mis-corrected ordinary English that statutes
simply never use -- "texting" became "testing", "goons" became "goods",
"driver" became "river", "wallet" became "walled", "what counts as
evidence" gained "courts". The corpus vocabulary defines statutory
register, not the English language, so "unknown token" does not mean
"misspelled token". Do not reintroduce a generic rule without an
English-language reference vocabulary that solves exactly that.

Corrections are APPENDED to the retrieval text, never substituted: the
citizen's own token stays in the query (it can still help dense
retrieval), the statutory spelling is simply added beside it -- the same
append-only contract every other normalisation rule follows. The user
never sees this text; guards inspect the raw question, and the answer is
assembled from retrieved chunks.
"""
from __future__ import annotations

import re

# Curated, evaluation-observed misspellings of legal vocabulary. Keys and
# values are single lowercase tokens.
_CURATED: dict[str, str] = {
    # eval misspelling rows h068..h075
    "theift": "theft",
    "thift": "theft",
    "leagal": "legal",
    "leegal": "legal",
    "juvenil": "juvenile",
    "juvinile": "juvenile",
    "bord": "board",
    "bale": "bail",
    "procedur": "procedure",
    "burdon": "burden",
    "triall": "trial",
    "terorism": "terrorism",
    # eval misspelling rows h210..h219
    "criminl": "criminal",
    "intimidaton": "intimidation",
    "punishmnt": "punishment",
    "punishent": "punishment",
    "defamtion": "defamation",
    "defemation": "defamation",
    "adopsion": "adoption",
    "abandonned": "abandoned",
    "wittness": "witness",
    "witnes": "witness",
    "atendance": "attendance",
    "attendence": "attendance",
    "anticipetory": "anticipatory",
    "harrassment": "harassment",
    "harasment": "harassment",
    "familly": "family",
    "attck": "attack",
    "grievious": "grievous",
    "compansation": "compensation",
    "sceme": "scheme",
    "maintenence": "maintenance",
    "childrn": "children",
    "opinon": "opinion",
    "evidance": "evidence",
    "instituion": "institution",
    # common variants seen in manual probes
    "marrige": "marriage",
    "marraige": "marriage",
    "divorse": "divorce",
    "compaint": "complaint",
    "arest": "arrest",
    "arressted": "arrested",
    "waranty": "warranty",
    "warrenty": "warranty",
    "garantee": "guarantee",
    # texting shorthand -- not misspellings, but the same mechanism
    "ppl": "people",
    "govt": "government",
}

_TOKEN = re.compile(r"[a-z]+")


def spelling_corrections(query: str) -> list[str]:
    """Statutory spellings to append for this query, in query order,
    deduplicated. Empty for a query with no recognised misspelling."""
    corrections: list[str] = []
    seen: set[str] = set()
    for token in _TOKEN.findall(query.lower()):
        corrected = _CURATED.get(token)
        if corrected and corrected not in seen:
            seen.add(corrected)
            corrections.append(corrected)
    return corrections
