"""Multi-turn context evaluation: fragment-only baseline vs deterministic
context resolution, through the PRODUCTION pipeline (handle_legal_query),
so guards, normalisation and the confidence gate all apply exactly as
they do for a citizen.

Two arms per follow-up row:

  BASELINE   the fragment alone, retrieved as the pre-context pipeline
             would have (search + confidence gate, no context layer) --
             what "what if I'm a minor?" used to get.
  CONTEXT    handle_legal_query(query, context=previous_question).

Reported per category:

  condition_follow_up   hit@5 (expected chunk among returned excerpts)
  ambiguous_follow_up   clarification asked (never a guessed answer)
  no_context_follow_up  clarification asked
  standalone_override   context correctly NOT applied, expected chunk hit
  guarded_follow_up     guard fired on the combined text (reason prefix)

Usage:  python services/ai/eval/run_context_eval.py
"""
from __future__ import annotations

import json
import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.pipeline import build_legal_answer, handle_legal_query  # noqa: E402
from app.query.context import ConversationContext  # noqa: E402
from app.query.normalize import normalize_for_retrieval  # noqa: E402
from app.retrieval.search import search  # noqa: E402

QUERIES_PATH = os.path.join(os.path.dirname(__file__), "queries_followup.jsonl")


def _load_rows() -> list[dict]:
    rows = []
    with open(QUERIES_PATH, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def _answered_chunks(answer) -> set[str]:
    return {excerpt.chunk_id for excerpt in answer.excerpts}


def _baseline_answer(query: str):
    """The pre-context pipeline's behaviour on the bare fragment:
    normalise, retrieve, gate. Guards are irrelevant for the comparison
    (every baseline fragment here is an in-domain fragment)."""
    return build_legal_answer(search(normalize_for_retrieval(query), top_k=5))


def main() -> int:
    rows = _load_rows()
    per_category: dict[str, list[tuple[str, bool, str]]] = defaultdict(list)
    baseline_hits = 0
    context_hits = 0
    condition_total = 0

    for row in rows:
        context = (
            ConversationContext(previous_question=row["previous_question"])
            if row.get("previous_question")
            else None
        )
        answer = handle_legal_query(row["query"], context=context)
        category = row["category"]
        expected = set(row.get("expect_chunks") or [])

        if category == "condition_follow_up":
            # Outcome-scored: the citizen got the right provision in the
            # answer, whether the context layer composed it or the
            # fragment stood well enough alone. The mechanism is reported
            # for diagnosis, not judged.
            condition_total += 1
            base = _baseline_answer(row["query"])
            base_hit = bool(expected & _answered_chunks(base))
            ctx_hit = bool(expected & _answered_chunks(answer))
            baseline_hits += base_hit
            context_hits += ctx_hit
            per_category[category].append(
                (
                    row["id"],
                    ctx_hit,
                    f"baseline_hit={base_hit} context_hit={ctx_hit} applied={answer.context_applied}",
                )
            )
        elif category in ("ambiguous_follow_up", "no_context_follow_up"):
            ok = answer.reason == "needs_context" and answer.abstained
            per_category[category].append((row["id"], ok, f"reason={answer.reason}"))
        elif category == "standalone_override":
            # What this category proves is context BEHAVIOUR: a complete
            # new question must not be dragged back to the old topic.
            # Whether its expected chunk lands in the top-5 is retrieval
            # quality, owned by the main eval sets -- reported here as
            # information, not as pass/fail.
            ok = (not answer.context_applied) and answer.policy_decision == "answered"
            hit = bool(expected & _answered_chunks(answer))
            per_category[category].append(
                (row["id"], ok, f"context_applied={answer.context_applied} decision={answer.policy_decision} hit@5={hit}")
            )
        elif category == "guarded_follow_up":
            prefix = row["expect_reason_prefix"]
            ok = answer.abstained and (answer.reason or "").startswith(prefix)
            per_category[category].append((row["id"], ok, f"reason={answer.reason}"))
        elif category == "not_emergency":
            # A past-tense account must reach the law (answer or a serious
            # redirect with excerpts), never an emergency helpline page.
            ok = answer.policy_decision != "redirect_emergency"
            per_category[category].append(
                (row["id"], ok, f"decision={answer.policy_decision} reason={answer.reason}")
            )

    print(f"rows: {len(rows)}\n")
    all_ok = True
    for category, results in per_category.items():
        passed = sum(1 for _, ok, _ in results if ok)
        print(f"{category}: {passed}/{len(results)}")
        for row_id, ok, detail in results:
            marker = "  ok " if ok else "  FAIL"
            if not ok:
                all_ok = False
            print(f"{marker} {row_id}: {detail}")
    print(
        f"\ncondition_follow_up hit@5: baseline (fragment only) "
        f"{baseline_hits}/{condition_total}  vs  with context {context_hits}/{condition_total}"
    )
    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
