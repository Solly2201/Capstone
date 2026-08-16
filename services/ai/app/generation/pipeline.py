"""Module 1B Batch 2: confidence gate, citation validation, abstention.

Flow this module implements (retrieval and Risk/UPL happen outside it --
see docs/ARCHITECTURE.md):

    results (already retrieved by the caller via app.retrieval.search)
        -> confidence gate
        -> context assembly (app.generation.context)
        -> LLMProvider.generate
        -> citation/index validation
        -> ChatResult

No LLM call happens unless the confidence gate passes -- an
unabstained answer is never generated from evidence CAP has already
judged too weak to ground a response in.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

from .context import build_messages
from .provider import LLMProvider

ABSTENTION_MESSAGE = "No verified information found."

_CITATION_REF = re.compile(r"\[(\d+)\]")

# Provisional, documented floor -- NOT a validated relevance measure.
# Empirical testing against the built index showed off-topic queries can
# score higher than genuine low-coverage topic queries with this corpus's
# unfiltered BM25 tokenization (e.g. "pizza toppings in mumbai" outscored
# "bail"), so no defensible cutoff exists in the data. This floor only
# catches degenerate near-zero matches; real grounding safety comes from
# the zero-result check below and from post-generation citation
# validation, not from this number. Override via LEGAL_CHAT_MIN_SCORE.
DEFAULT_MIN_SCORE = 3.0


def _min_score() -> float:
    raw = os.environ.get("LEGAL_CHAT_MIN_SCORE")
    if raw is None:
        return DEFAULT_MIN_SCORE
    try:
        return float(raw)
    except ValueError:
        return DEFAULT_MIN_SCORE


@dataclass
class ChatResult:
    answer: str
    citations: list[dict] = field(default_factory=list)
    abstained: bool = False
    reason: str | None = None


def _passes_confidence_gate(results: list[dict]) -> bool:
    if not results:
        return False
    return results[0]["score"] >= _min_score()


def _extract_valid_citations(text: str, index_map: dict[int, dict]) -> list[dict]:
    """Resolve every [n] reference in text to its real citation.

    Never trusts the model's own restated citation text -- only the
    index is read from the model's output; the actual source, act
    number, official URL, etc. always come from index_map, which was
    built server-side from real retrieved chunks. References to an
    index outside index_map are silently dropped (the model referenced
    something that was never actually given to it).
    """
    seen: list[int] = []
    for match in _CITATION_REF.finditer(text):
        n = int(match.group(1))
        if n in index_map and n not in seen:
            seen.append(n)
    return [index_map[n] for n in seen]


def answer_question(
    question: str, results: list[dict], provider: LLMProvider
) -> ChatResult:
    """Run the full generation pipeline for one question.

    `results` must already be retrieved (via app.retrieval.search) and
    Risk/UPL-cleared by the caller -- this function only handles the
    confidence gate onward.
    """
    if not results:
        return ChatResult(answer=ABSTENTION_MESSAGE, abstained=True, reason="no_matching_content")

    if not _passes_confidence_gate(results):
        return ChatResult(answer=ABSTENTION_MESSAGE, abstained=True, reason="insufficient_evidence")

    messages, index_map = build_messages(question, results)
    raw_answer = provider.generate(messages)

    citations = _extract_valid_citations(raw_answer, index_map)
    if not citations:
        # The model produced no citation that traces back to a passage it
        # was actually given -- treat as ungrounded rather than pass an
        # uncited claim through. This is the second (post-generation)
        # layer of "never answer beyond retrieved evidence", independent
        # of the pre-generation confidence gate above.
        return ChatResult(answer=ABSTENTION_MESSAGE, abstained=True, reason="ungrounded_response")

    return ChatResult(answer=raw_answer, citations=citations, abstained=False, reason=None)
