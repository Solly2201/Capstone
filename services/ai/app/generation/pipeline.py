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

# Provisional, documented floor -- NOT a validated relevance measure.
# Empirical testing against the built index showed off-topic queries can
# score higher than genuine low-coverage topic queries with this corpus's
# unfiltered BM25 tokenization (e.g. "pizza toppings in mumbai" outscored
# "bail"), so no defensible cutoff exists in the data. This floor only
# catches degenerate near-zero matches. Override via LEGAL_CHAT_MIN_SCORE.
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
    if not results:
        return False
    return results[0]["score"] >= _min_score()


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
