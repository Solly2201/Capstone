#!/usr/bin/env python3
"""Evaluate a candidate dense embedding model against both eval sets
WITHOUT touching the production index (services/ai/data/index/).

Builds a temporary index directory: bm25.pkl and chunk_manifest.jsonl are
copied unchanged from production (BM25 doesn't depend on the embedding
model), dense_vectors.npy is freshly computed for the candidate model over
the full corpus using the exact same text format production indexing uses
(index_build.py's "{title}. {text}"), and index_manifest.json records the
candidate model's name/path so query-time embedding
(app/retrieval/embeddings.embed_query) transparently uses the same
candidate model. app.retrieval.search's module-level _INDEX_DIR is then
pointed at this temp directory for the rest of THIS PROCESS only -- the
real data/index/ directory is never written to.

Reuses eval/run_eval.py's actual metric functions (recall@k, MRR, nDCG@k,
citation correctness, abstention accuracy) rather than reimplementing
them, so candidate numbers are directly comparable to every baseline
number already recorded in docs/RETRIEVAL_EVALUATION.md.

Usage:
  python finetune/eval_candidate.py --model finetune/output/run1/model --label run1
  python finetune/eval_candidate.py --model sentence-transformers/all-MiniLM-L6-v2 --label baseline
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import tempfile

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_ADVISORY_WARNINGS", "1")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "eval"))

PROD_INDEX_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "index")


def build_temp_index(model_path_or_name: str, temp_dir: str) -> None:
    from app.ingestion.pipeline import load_all_chunks
    from app.retrieval import embeddings as dense_embeddings

    os.makedirs(temp_dir, exist_ok=True)
    shutil.copy(os.path.join(PROD_INDEX_DIR, "bm25.pkl"), os.path.join(temp_dir, "bm25.pkl"))
    shutil.copy(os.path.join(PROD_INDEX_DIR, "chunk_manifest.jsonl"), os.path.join(temp_dir, "chunk_manifest.jsonl"))

    chunks = load_all_chunks()
    texts = [f"{c.title}. {c.text}" if c.title else c.text for c in chunks]
    print(f"Encoding {len(texts)} chunks with candidate model {model_path_or_name} ...")
    vectors = dense_embeddings.embed_texts(texts, name=model_path_or_name)

    import numpy as np

    np.save(os.path.join(temp_dir, "dense_vectors.npy"), vectors)
    manifest = {
        "chunk_count": len(chunks),
        "dense_embedding_model": model_path_or_name,
        "dense_embedding_dim": int(vectors.shape[1]),
        "mode": "hybrid",
    }
    with open(os.path.join(temp_dir, "index_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)


def point_search_at(temp_dir: str) -> None:
    from app.retrieval import search as search_mod

    search_mod._INDEX_DIR = temp_dir
    # Caches are lazy (populated on first access) so resetting them here
    # (defensive, in case anything imported search_mod before this call)
    # guarantees no stale production-index state leaks into this run.
    search_mod._bm25_cache = None
    search_mod._chunk_manifest_cache = None
    search_mod._dense_cache = None
    search_mod._index_manifest_cache = None
    search_mod._chunk_cache = {}


SHORT_TITLE_PROBES = [
    ("pwdva:1", "what protection can a woman get from violence within her own household"),
    ("cpa2019:1", "what protections do consumers have against unsafe products"),
    ("jj2015:1", "what happens when a child breaks the law"),
    ("lsa:1", "how can I get free legal aid"),
    ("it_act:1", "how do internet crimes get punished"),
]

TARGETED_QUERIES = {
    "q17": "constitution:20",
    "q18": "constitution:21",
    "q23": "bnss:173",
    "q26": "bns:303",
    "q40": "lsa:13",
    "q46": "constitution:15",
}


def run_targeted_checks(top_k: int = 5) -> dict:
    from app.retrieval.search import search
    from app.retrieval import search as search_mod

    results = {}
    for qid, target in TARGETED_QUERIES.items():
        query_text = _lookup_query_text(qid)
        hits = search(query_text, top_k=top_k, mode="hybrid")
        ids = [h["chunk_id"] for h in hits]
        dense_scores = search_mod._dense_scores(query_text)
        dl = search_mod._ranked_ids(dense_scores)
        dense_rank = dl.index(target) + 1 if target in dl else None
        results[qid] = {
            "query": query_text,
            "target": target,
            "in_top5": target in ids,
            "top5": ids,
            "dense_rank": dense_rank,
        }

    short_title = {}
    for chunk_id, probe_query in SHORT_TITLE_PROBES:
        dense_scores = search_mod._dense_scores(probe_query)
        dl = search_mod._ranked_ids(dense_scores)
        rank = dl.index(chunk_id) + 1 if chunk_id in dl else None
        short_title[chunk_id] = {"probe_query": probe_query, "dense_rank": rank}

    return {"targeted_queries": results, "short_title_artifact": short_title}


def _lookup_query_text(qid: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "..", "eval", "queries.jsonl")
    with open(path, encoding="utf-8") as f:
        for line in f:
            row = json.loads(line)
            if row["id"] == qid:
                return row["query"]
    raise KeyError(qid)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", required=True, help="Model name or local path")
    parser.add_argument("--label", required=True)
    parser.add_argument("--json-out", help="Optional path to dump full results as JSON")
    parser.add_argument("--keep-temp-index", action="store_true", help="Don't delete the temp index dir (for reuse)")
    args = parser.parse_args()

    temp_dir = os.path.join(tempfile.gettempdir(), f"cap_eval_index_{args.label}")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    build_temp_index(args.model, temp_dir)
    point_search_at(temp_dir)

    from run_eval import evaluate_abstention, evaluate_retrieval, load_queries, summarize

    all_results = {"label": args.label, "model": args.model}
    for set_name, path in [
        ("original_49", os.path.join(os.path.dirname(__file__), "..", "eval", "queries.jsonl")),
        ("citizen_129", os.path.join(os.path.dirname(__file__), "..", "eval", "queries_human.jsonl")),
    ]:
        queries = load_queries(path)
        set_results = {}
        for mode in ["bm25", "dense", "hybrid"]:
            retrieval_results = evaluate_retrieval(queries, mode, top_k=5)
            abstention = evaluate_abstention(queries, mode)
            summary = summarize(mode, retrieval_results, top_k=5)
            summary["abstention_accuracy"] = round(abstention["accuracy"], 4)
            summary["abstention_false_answer_ids"] = abstention["false_answer_ids"]
            summary["abstention_false_abstain_ids"] = abstention["false_abstain_ids"]
            set_results[mode] = summary
        all_results[set_name] = set_results

    all_results["targeted"] = run_targeted_checks()

    print(json.dumps(all_results, indent=2))

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as f:
            json.dump(all_results, f, indent=2)
        print(f"\nWritten to {args.json_out}")

    if not args.keep_temp_index:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
