"""Deterministic response formatting helpers for Module 1B.

No LLM prompt is built here (or anywhere in this project's legal-answer
path -- see docs/PROJECT_STATE.md's standing "no generative LLM in the
legal-answer pipeline" decision). This module only groups/labels
already-retrieved search() results for a structured response.
"""
from __future__ import annotations


def distinct_sources(results: list[dict]) -> set[str]:
    """The set of citation "source" display names present in results.

    More than one entry here means the retrieved evidence spans
    multiple legal sources. Pure retrieval doesn't need to "reconcile"
    this the way a generated single-paragraph answer would -- each
    result is already returned as its own excerpt with its own
    citation, so distinct sources are naturally kept separate by
    construction. This helper exists for callers that want to group or
    label excerpts by source for display.
    """
    return {r["citation"]["source"] for r in results}
