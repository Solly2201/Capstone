"""Deterministic legal-answer pipeline -- no generative LLM.

Flow:
    question
        -> Risk/UPL check (app.safety.risk), deterministic rules
        -> app.retrieval.search (BM25, retrieval-only)
        -> confidence gate
        -> LegalAnswer built directly from the retrieved chunks

Standing project decision: the legal-answer path never uses a
generative LLM to produce an answer, to eliminate hallucination risk
(see docs/PROJECT_STATE.md). Every excerpt in a LegalAnswer is the
verbatim retrieved chunk text with its real citation -- nothing here
invents, paraphrases, or infers legal content. Multiple sources are
returned as multiple separate excerpts rather than merged into one
synthesized paragraph, so conflicting or overlapping evidence is
preserved by construction, not by special-case "conflict" logic.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from ..retrieval.search import search as _search
from ..safety.risk import EMERGENCY_CONTACTS, PERSONALIZED_ADVICE_MESSAGE, classify_risk
from .context import distinct_sources

ABSTENTION_MESSAGE = "No verified information found."

# Provisional, documented floors -- NOT a validated relevance measure.
# Empirical testing against the built index showed off-topic queries can
# score higher than genuine low-coverage topic queries with this corpus's
# unfiltered BM25 tokenization (e.g. "pizza toppings in mumbai" outscored
# "bail"), so no defensible cutoff exists in the data. These floors only
# catch degenerate near-zero matches. Override via LEGAL_CHAT_MIN_SCORE
# (applies to whichever mode is actually in effect for the top result).
#
# BM25 and dense-cosine scores are on entirely different scales --
# BM25 is an unbounded corpus-relative lexical score, cosine similarity
# is bounded in [-1, 1] -- so a single global threshold would be
# meaningless for one or the other. Values below were chosen by
# sweeping thresholds against eval/queries.jsonl's labeled
# answer/abstain queries (see docs/RETRIEVAL_EVALUATION.md) and picking
# the point that eliminates outright wrong-topic top hits while still
# answering most genuinely-covered queries -- not a perfect separator
# (none exists on this corpus/query set), but a measured one.
DEFAULT_MIN_SCORE_BY_MODE = {
    "bm25": 3.0,
    "dense": 0.45,
    "hybrid": 0.40,  # gates on the top hit's dense_score, not its RRF score -- see _passes_confidence_gate
}
DEFAULT_MIN_SCORE = DEFAULT_MIN_SCORE_BY_MODE["bm25"]  # kept for direct build_legal_answer() callers/tests


def _min_score(mode: str = "bm25") -> float:
    raw = os.environ.get("LEGAL_CHAT_MIN_SCORE")
    if raw is not None:
        try:
            return float(raw)
        except ValueError:
            pass
    return DEFAULT_MIN_SCORE_BY_MODE.get(mode, DEFAULT_MIN_SCORE)


@dataclass
class Excerpt:
    chunk_id: str
    text: str
    citation: dict
    coverage_note: str


@dataclass
class LegalAnswer:
    excerpts: list[Excerpt] = field(default_factory=list)
    # Set for abstention/redirect cases; None when excerpts carry the answer.
    message: str | None = None
    abstained: bool = False
    reason: str | None = None
    # "answered" | "abstained" | "redirect_emergency" | "redirect_adviser"
    policy_decision: str = "answered"
    sources: list[str] = field(default_factory=list)


def _passes_confidence_gate(results: list[dict]) -> bool:
    """Reciprocal Rank Fusion's score is a sum of 1/(k+rank) terms, so it
    reflects a chunk's *relative* rank position within a small candidate
    pool, not its *absolute* relevance -- on this corpus it compresses
    into a narrow band (~0.027-0.033) for the single top hit regardless
    of whether the query is genuinely covered (see
    docs/RETRIEVAL_EVALUATION.md), which makes it useless as a
    confidence-gate signal. Gating hybrid mode on the top hit's
    dense_score (bounded, and empirically the best-separated signal
    available) instead of its fused "score" avoids that trap. bm25 and
    dense modes gate on their own native score as before.
    """
    if not results:
        return False
    top = results[0]
    mode = top.get("retrieval_mode", "bm25")
    if mode == "hybrid":
        gate_score = top.get("dense_score")
        if gate_score is None:
            gate_score = top["score"]
    else:
        gate_score = top["score"]
    return gate_score >= _min_score(mode)


def build_legal_answer(results: list[dict]) -> LegalAnswer:
    """Build a deterministic answer directly from already-retrieved results.

    `results` must already be retrieved (via app.retrieval.search) and
    Risk/UPL-cleared by the caller -- this function only handles the
    confidence gate and response assembly.
    """
    if not results:
        return LegalAnswer(
            message=ABSTENTION_MESSAGE, abstained=True, reason="no_matching_content", policy_decision="abstained"
        )

    if not _passes_confidence_gate(results):
        return LegalAnswer(
            message=ABSTENTION_MESSAGE, abstained=True, reason="insufficient_evidence", policy_decision="abstained"
        )

    excerpts = [
        Excerpt(chunk_id=r["chunk_id"], text=r["text"], citation=r["citation"], coverage_note=r["coverage_note"])
        for r in results
    ]
    return LegalAnswer(excerpts=excerpts, sources=sorted(distinct_sources(results)), policy_decision="answered")


def handle_legal_query(question: str, top_k: int = 5) -> LegalAnswer:
    """Full Module 1B entry point: Risk/UPL -> retrieval -> deterministic answer.

    Risk/UPL runs first and, if triggered, returns immediately -- no
    retrieval call happens for a message that hard-stops here.
    """
    category = classify_risk(question)
    if category == "personalized_advice":
        return LegalAnswer(
            message=PERSONALIZED_ADVICE_MESSAGE,
            abstained=True,
            reason="risk_personalized_advice",
            policy_decision="redirect_adviser",
        )
    if category is not None:
        return LegalAnswer(
            message=EMERGENCY_CONTACTS[category],
            abstained=True,
            reason=f"risk_{category}",
            policy_decision="redirect_emergency",
        )

    results = _search(question, top_k=top_k)
    return build_legal_answer(results)
