"""Context assembly for Module 1B's grounded chat.

Turns already-retrieved search() results into a message list for an
LLMProvider, using numbered references ([1], [2], ...) instead of
asking the model to restate section numbers itself. Numbered
references are trivially validated downstream (in range or not);
free-text citations the model reconstructs from memory are not, and
risk being a hallucination surface (e.g. "Section 2" exists in three
different sources in this corpus).

This module does not call search() itself and does not decide whether
retrieval was sufficient -- that is the confidence gate's job (Batch
2). It only knows how to turn results into a prompt.
"""
from __future__ import annotations

from .provider import ChatMessage

SYSTEM_PROMPT = (
    "You are CAP's legal information assistant for India. You are not a lawyer "
    "and must never give personalised legal advice or predict case outcomes. "
    "Answer ONLY using the numbered context passages provided below -- never use "
    "outside knowledge, even if you believe it is correct. Every factual claim "
    "you make must be followed by the bracketed number(s) of the context "
    "passage(s) it comes from, e.g. \"...requires a warrant [2].\" If the "
    "provided context does not contain enough information to answer, say so "
    "plainly instead of guessing or filling the gap from general knowledge. "
    "Never claim to have taken an action (e.g. contacted police, filed a "
    "report) -- you can only provide information."
)

# Appended only when the retrieved passages come from more than one legal
# source. CAP does not attempt to algorithmically decide which source is
# "correct" when they differ (that would itself be a legal judgment) --
# instead the model is instructed to keep each source's citation separate
# and never silently merge or pick between them.
MULTI_SOURCE_CLAUSE = (
    " The numbered passages above come from more than one legal source. If "
    "they define or address the same point differently, describe each "
    "source's position separately with its own bracketed citation. Do not "
    "merge them into one combined rule, and do not silently prefer one "
    "source over another -- state plainly that the sources differ."
)


def distinct_sources(results: list[dict]) -> set[str]:
    """The set of citation "source" display names present in results.

    More than one entry here means the retrieved evidence spans multiple
    legal sources -- the trigger for the conflicting-evidence prompt clause.
    """
    return {r["citation"]["source"] for r in results}


def build_messages(
    question: str, results: list[dict]
) -> tuple[list[ChatMessage], dict[int, dict]]:
    """Build (messages, index_map).

    index_map maps each [n] reference used in the prompt to the source
    chunk_id/citation it corresponds to, so a later citation-validation
    step (Batch 2) can resolve the model's [n] references back to real,
    retrieved citations without trusting anything the model says about
    them.
    """
    index_map: dict[int, dict] = {}
    context_lines: list[str] = []
    for i, result in enumerate(results, start=1):
        index_map[i] = {"chunk_id": result["chunk_id"], "citation": result["citation"]}
        citation = result["citation"]
        context_lines.append(
            f"[{i}] {citation['source']}, {citation['unit']}: {result['text']}"
        )

    context_block = "\n\n".join(context_lines) if context_lines else "(no context retrieved)"
    user_content = f"Context passages:\n\n{context_block}\n\nQuestion: {question}"

    system_content = SYSTEM_PROMPT
    if len(distinct_sources(results)) > 1:
        system_content += MULTI_SOURCE_CLAUSE

    messages = [
        ChatMessage(role="system", content=system_content),
        ChatMessage(role="user", content=user_content),
    ]
    return messages, index_map
