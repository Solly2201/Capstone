#!/usr/bin/env python3
"""Retrieval evaluation harness: BM25 vs dense vs hybrid, on the real corpus.

Usage:
  python eval/run_eval.py                 # evaluate all modes, top_k=5
  python eval/run_eval.py --mode bm25
  python eval/run_eval.py --top-k 10
  python eval/run_eval.py --json out.json # also dump raw per-query results

This measures whether hybrid retrieval actually improves on the BM25
baseline on this project's real query distribution (eval/queries.jsonl,
hand-curated against the actually-ingested corpus) -- it is not a
synthetic benchmark. It also measures abstention behavior: for queries
whose expected answer is "no verified information found" (topics
genuinely not yet ingested, or out-of-domain queries), it runs the full
deterministic pipeline (handle_legal_query) rather than raw search(),
since abstention is a property of the confidence gate, not of search()
alone.

No generative LLM involved anywhere in this script or in what it
evaluates -- it only calls app.retrieval.search and
app.generation.pipeline, both pure-retrieval/deterministic.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
from dataclasses import dataclass, field

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.pipeline import handle_legal_query  # noqa: E402
from app.retrieval.search import search  # noqa: E402

QUERIES_PATH = os.path.join(os.path.dirname(__file__), "queries.jsonl")


def load_queries() -> list[dict]:
    with open(QUERIES_PATH, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


@dataclass
class QueryResult:
    query_id: str
    category: str
    expect_abstain: bool
    retrieved_ids: list[str] = field(default_factory=list)
    relevant_ids: set[str] = field(default_factory=set)
    abstained: bool = False
    citations_valid: bool = True


def _recall_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    if not relevant:
        return float("nan")
    hit = len(set(retrieved[:k]) & relevant)
    return hit / len(relevant)


def _precision_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    if not relevant:
        return float("nan")
    window = retrieved[:k]
    if not window:
        return 0.0
    hit = len(set(window) & relevant)
    return hit / len(window)


def _reciprocal_rank(retrieved: list[str], relevant: set[str]) -> float:
    if not relevant:
        return float("nan")
    for i, cid in enumerate(retrieved, start=1):
        if cid in relevant:
            return 1.0 / i
    return 0.0


def _ndcg_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    if not relevant:
        return float("nan")
    dcg = sum(
        1.0 / math.log2(i + 1) for i, cid in enumerate(retrieved[:k], start=1) if cid in relevant
    )
    ideal_hits = min(len(relevant), k)
    idcg = sum(1.0 / math.log2(i + 1) for i in range(1, ideal_hits + 1))
    return dcg / idcg if idcg > 0 else 0.0


def evaluate_retrieval(queries: list[dict], mode: str, top_k: int) -> list[QueryResult]:
    """Runs app.retrieval.search directly (bypassing Risk/UPL and the
    confidence gate, which don't apply to relevance-only queries)."""
    results = []
    for q in queries:
        if q["expect_abstain"]:
            continue  # abstention is evaluated separately via the full pipeline
        hits = search(q["query"], top_k=top_k, mode=mode)
        results.append(
            QueryResult(
                query_id=q["id"],
                category=q["category"],
                expect_abstain=False,
                retrieved_ids=[h["chunk_id"] for h in hits],
                relevant_ids=set(q["relevant_chunk_ids"]),
            )
        )
    return results


def evaluate_abstention(queries: list[dict], mode: str) -> dict:
    """Runs the full deterministic pipeline (Risk/UPL -> retrieval ->
    confidence gate) with RETRIEVAL_MODE forced to `mode`, and checks
    whether abstention behavior matches expectation for every query
    (not just the expect_abstain=True ones -- a query expected to
    answer must NOT abstain either)."""
    old_mode = os.environ.get("RETRIEVAL_MODE")
    os.environ["RETRIEVAL_MODE"] = mode
    try:
        correct = 0
        false_abstain = []  # expected an answer, pipeline abstained
        false_answer = []   # expected abstention, pipeline answered
        for q in queries:
            answer = handle_legal_query(q["query"])
            got_abstain = answer.abstained
            if got_abstain == q["expect_abstain"]:
                correct += 1
            elif q["expect_abstain"] and not got_abstain:
                false_answer.append(q["id"])
            elif not q["expect_abstain"] and got_abstain:
                false_abstain.append(q["id"])
        return {
            "accuracy": correct / len(queries),
            "false_answer_ids": false_answer,   # should have abstained, didn't (risk: wrong info shown)
            "false_abstain_ids": false_abstain,  # should have answered, abstained (recall loss)
        }
    finally:
        if old_mode is None:
            os.environ.pop("RETRIEVAL_MODE", None)
        else:
            os.environ["RETRIEVAL_MODE"] = old_mode


def _citation_correctness(queries_by_id: dict, results: list[QueryResult]) -> float:
    """Fraction of non-abstain-expected queries whose top-ranked result's
    chunk_id is actually inside the ground-truth relevant set -- i.e. the
    citation shown for the top hit is defensible, not just "a" result."""
    checked = 0
    correct = 0
    for r in results:
        if not r.relevant_ids or not r.retrieved_ids:
            continue
        checked += 1
        if r.retrieved_ids[0] in r.relevant_ids:
            correct += 1
    return correct / checked if checked else float("nan")


def summarize(mode: str, results: list[QueryResult], top_k: int) -> dict:
    def avg(fn):
        vals = [v for v in (fn(r.retrieved_ids, r.relevant_ids) for r in results) if not math.isnan(v)]
        return sum(vals) / len(vals) if vals else float("nan")

    return {
        "mode": mode,
        "n_queries": len(results),
        f"recall@{top_k}": round(avg(lambda ret, rel: _recall_at_k(ret, rel, top_k)), 4),
        f"precision@{top_k}": round(avg(lambda ret, rel: _precision_at_k(ret, rel, top_k)), 4),
        "mrr": round(avg(_reciprocal_rank), 4),
        f"ndcg@{top_k}": round(avg(lambda ret, rel: _ndcg_at_k(ret, rel, top_k)), 4),
        "top1_citation_correctness": round(_citation_correctness({}, results), 4),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["bm25", "dense", "hybrid"], help="Evaluate a single mode only")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--json", help="Optional path to dump full per-query results as JSON")
    args = parser.parse_args()

    queries = load_queries()
    modes = [args.mode] if args.mode else ["bm25", "dense", "hybrid"]

    summary_rows = []
    dump = {}
    for mode in modes:
        retrieval_results = evaluate_retrieval(queries, mode, args.top_k)
        abstention = evaluate_abstention(queries, mode)
        summary = summarize(mode, retrieval_results, args.top_k)
        summary["abstention_accuracy"] = round(abstention["accuracy"], 4)
        summary["abstention_false_answer_ids"] = abstention["false_answer_ids"]
        summary["abstention_false_abstain_ids"] = abstention["false_abstain_ids"]
        summary_rows.append(summary)
        dump[mode] = {
            "summary": summary,
            "per_query": [
                {
                    "id": r.query_id,
                    "category": r.category,
                    "retrieved_ids": r.retrieved_ids,
                    "relevant_ids": sorted(r.relevant_ids),
                    "recall": _recall_at_k(r.retrieved_ids, r.relevant_ids, args.top_k),
                    "mrr": _reciprocal_rank(r.retrieved_ids, r.relevant_ids),
                }
                for r in retrieval_results
            ],
        }

    col_order = [
        "mode", "n_queries", f"recall@{args.top_k}", f"precision@{args.top_k}", "mrr",
        f"ndcg@{args.top_k}", "top1_citation_correctness", "abstention_accuracy",
    ]
    header = " | ".join(f"{c:>22}" for c in col_order)
    print(header)
    print("-" * len(header))
    for row in summary_rows:
        print(" | ".join(f"{str(row[c]):>22}" for c in col_order))
    for row in summary_rows:
        if row["abstention_false_answer_ids"] or row["abstention_false_abstain_ids"]:
            print(
                f"\n{row['mode']}: false_answer(should-abstain-but-answered)="
                f"{row['abstention_false_answer_ids']} "
                f"false_abstain(should-answer-but-abstained)={row['abstention_false_abstain_ids']}"
            )

    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(dump, f, indent=2)
        print(f"\nFull per-query results written to {args.json}")


if __name__ == "__main__":
    main()
