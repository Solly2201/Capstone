#!/usr/bin/env python3
"""Targeted diagnostic dump: for one or more query ids, show full BM25/dense
rank of each relevant chunk (not just top-5), plus what's actually sitting
at hybrid ranks 1-5 instead. Read-only, does not touch the index or pipeline.

Usage:
  python eval/diagnose.py q17 q46
  python eval/diagnose.py --all-failing   # every non-abstain query hybrid misses at top-5
"""
from __future__ import annotations

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.retrieval import search as search_mod  # noqa: E402
from app.retrieval.search import search  # noqa: E402
from app.retrieval.query_expand import expand_query  # noqa: E402
from app.retrieval.fusion import (  # noqa: E402
    DEFAULT_BM25_WEIGHT,
    DEFAULT_DENSE_WEIGHT,
    DEFAULT_RRF_K,
    reciprocal_rank_fusion,
)

QUERIES_PATH = os.path.join(os.path.dirname(__file__), "queries.jsonl")


def load_queries(path: str = QUERIES_PATH) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def full_rank(query: str, chunk_id: str) -> dict:
    """Full (uncapped for BM25; top-50-pool for dense/hybrid) rank of
    chunk_id for query -- bypasses top_k so a target far outside the
    candidate pool is still visible instead of silently absent."""
    expanded = expand_query(query)
    bm25_scores = search_mod._bm25_scores(expanded)
    dense_scores = search_mod._dense_scores(expanded)
    bm25_sorted = search_mod._ranked_ids(bm25_scores, positive_only=True)
    dense_sorted = search_mod._ranked_ids(dense_scores)
    bm25_rank = bm25_sorted.index(chunk_id) + 1 if chunk_id in bm25_sorted else None

    dense_rank = dense_sorted.index(chunk_id) + 1 if chunk_id in dense_sorted else None

    bm25_pool = search_mod._ranked_ids(bm25_scores, limit=50, positive_only=True)
    dense_pool = search_mod._ranked_ids(dense_scores, limit=50)
    fused = reciprocal_rank_fusion(
        [bm25_pool, dense_pool],
        k=DEFAULT_RRF_K,
        weights=[DEFAULT_BM25_WEIGHT, DEFAULT_DENSE_WEIGHT],
    )
    ranked = sorted(fused, key=lambda cid: fused[cid], reverse=True)
    hybrid_rank = ranked.index(chunk_id) + 1 if chunk_id in ranked else None

    return {
        "chunk_id": chunk_id,
        "bm25_rank": bm25_rank,
        "bm25_score": round(bm25_scores.get(chunk_id, 0.0), 4),
        "bm25_pool_size": len(bm25_sorted),
        "dense_rank": dense_rank,
        "dense_score": round(dense_scores.get(chunk_id, 0.0), 4),
        "dense_pool_size": len(dense_sorted),
        "hybrid_rank": hybrid_rank,
    }


def diagnose(q: dict, top_k: int = 5) -> None:
    print(f"\n=== {q['id']} [{q['category']}] ===")
    print(f"query: {q['query']!r}")
    expanded = expand_query(q["query"])
    if expanded != q["query"]:
        print(f"expanded to: {expanded!r}")
    print(f"expected: {q['relevant_chunk_ids']}")

    for rel_id in q["relevant_chunk_ids"]:
        info = full_rank(q["query"], rel_id)
        print(
            f"  target {rel_id}: bm25_rank={info['bm25_rank']}/{info['bm25_pool_size']} "
            f"(score={info['bm25_score']})  dense_rank={info['dense_rank']}/{info['dense_pool_size']} "
            f"(score={info['dense_score']})  hybrid_rank(top50 pool)={info['hybrid_rank']}"
        )

    hits = search(q["query"], top_k=top_k, mode="hybrid")
    print(f"  hybrid top-{top_k} actually returned:")
    for h in hits:
        hit_flag = "HIT" if h["chunk_id"] in q["relevant_chunk_ids"] else "   "
        print(
            f"    [{hit_flag}] {h['chunk_id']:20s} title={h['title']!r:50s} "
            f"fused={h['score']} bm25_rank={h['bm25_rank']} dense_rank={h['dense_rank']}"
        )


def list_top5_misses(queries: list[dict], top_k: int = 5) -> tuple[list[str], list[tuple[str, int, int]]]:
    """Returns (zero_hit_ids, partial_hit[(id, hit_count, relevant_count)])."""
    zero_hit = []
    partial = []
    for q in queries:
        if q["expect_abstain"]:
            continue
        hits = search(q["query"], top_k=top_k, mode="hybrid")
        retrieved = {h["chunk_id"] for h in hits}
        relevant = set(q["relevant_chunk_ids"])
        hit_count = len(retrieved & relevant)
        if hit_count == 0:
            zero_hit.append(q["id"])
        elif hit_count < len(relevant):
            partial.append((q["id"], hit_count, len(relevant)))
    return zero_hit, partial


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("ids", nargs="*", help="query ids to diagnose")
    parser.add_argument(
        "--all-failing",
        action="store_true",
        help="diagnose every non-abstain query hybrid misses (zero or partial hit) in top-5",
    )
    parser.add_argument("--queries", default=QUERIES_PATH, help="path to a queries.jsonl file")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    queries = load_queries(args.queries)
    by_id = {q["id"]: q for q in queries}

    if args.all_failing:
        zero_hit, partial = list_top5_misses(queries, top_k=args.top_k)
        print(f"Zero-hit (top-{args.top_k}) queries: {zero_hit}")
        print(f"Partial-hit (multi-relevant, some found) queries: {partial}")
        target_ids = zero_hit + [pid for pid, _, _ in partial]
    else:
        target_ids = args.ids

    for qid in target_ids:
        if qid not in by_id:
            print(f"unknown query id: {qid}")
            continue
        diagnose(by_id[qid], top_k=args.top_k)


if __name__ == "__main__":
    main()
