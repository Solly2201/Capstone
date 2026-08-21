#!/usr/bin/env python3
"""Evaluate base vs. candidate model on ONLY the queries never seen during
training (finetune/data/test.jsonl's query_ids) -- the honest generalization
check. Full-eval-set numbers from eval_candidate.py are contaminated for any
query whose (query, positive) pair was used in train/val, since the model
was directly optimized (train) or selected-for (val) on that exact pair;
only test-split queries measure genuine generalization to unseen phrasing.
"""
from __future__ import annotations

import json
import os
import shutil
import sys
import tempfile

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_ADVISORY_WARNINGS", "1")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "eval"))

from finetune.eval_candidate import build_temp_index, point_search_at  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
EVAL_DIR = os.path.join(os.path.dirname(__file__), "..", "eval")


def held_out_query_ids() -> dict[str, set[str]]:
    """Returns {'orig': {...}, 'human': {...}} -- the bare q##/h## ids in
    the test split, split by which eval file they came from."""
    with open(os.path.join(DATA_DIR, "test.jsonl"), encoding="utf-8") as f:
        rows = [json.loads(l) for l in f if l.strip()]
    out = {"orig": set(), "human": set()}
    for r in rows:
        tag, qid = r["query_id"].split(":", 1)
        out["orig" if tag == "orig" else "human"].add(qid)
    return out


def evaluate_model(model_path_or_name: str, label: str, held_out: dict[str, set[str]]) -> dict:
    from run_eval import evaluate_abstention, evaluate_retrieval, load_queries, summarize

    temp_dir = os.path.join(tempfile.gettempdir(), f"cap_heldout_index_{label}")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    build_temp_index(model_path_or_name, temp_dir)
    point_search_at(temp_dir)

    results = {}
    for set_name, path, key in [
        ("original", os.path.join(EVAL_DIR, "queries.jsonl"), "orig"),
        ("citizen", os.path.join(EVAL_DIR, "queries_human.jsonl"), "human"),
    ]:
        all_queries = load_queries(path)
        held = held_out[key]
        subset = [q for q in all_queries if q["id"] in held]
        n_non_abstain = len([q for q in subset if not q["expect_abstain"]])
        print(f"{set_name}: {len(subset)} held-out queries ({n_non_abstain} non-abstain)")

        set_results = {}
        for mode in ["dense", "hybrid"]:
            retrieval_results = evaluate_retrieval(subset, mode, top_k=5)
            abstention = evaluate_abstention(subset, mode)
            summary = summarize(mode, retrieval_results, top_k=5)
            summary["abstention_accuracy"] = round(abstention["accuracy"], 4)
            summary["abstention_false_answer_ids"] = abstention["false_answer_ids"]
            summary["abstention_false_abstain_ids"] = abstention["false_abstain_ids"]
            set_results[mode] = summary
        results[set_name] = set_results

    shutil.rmtree(temp_dir, ignore_errors=True)
    return results


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--run-name", default="run1")
    args = parser.parse_args()

    held_out = held_out_query_ids()
    print("Held-out (test-split) query ids:", held_out)
    print()

    print("=== BASE model (all-MiniLM-L6-v2) on held-out queries ===")
    base_results = evaluate_model("sentence-transformers/all-MiniLM-L6-v2", "base_heldout", held_out)
    print(json.dumps(base_results, indent=2))

    print()
    print(f"=== CANDIDATE model ({args.run_name}) on held-out queries ===")
    candidate_results = evaluate_model(
        os.path.join(os.path.dirname(__file__), "output", args.run_name, "model"),
        "candidate_heldout",
        held_out,
    )
    print(json.dumps(candidate_results, indent=2))

    out = {"base": base_results, "candidate": candidate_results, "held_out_ids": {k: sorted(v) for k, v in held_out.items()}}
    out_path = os.path.join(os.path.dirname(__file__), "output", args.run_name, "heldout_eval_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(f"\nWritten to {out_path}")


if __name__ == "__main__":
    main()
