#!/usr/bin/env python3
"""Build a (query, positive_chunk, hard_negative_chunk) triplet dataset for
dense-embedding fine-tuning, from the project's two hand-verified evaluation
sets (eval/queries.jsonl, eval/queries_human.jsonl).

Every positive is a (query, relevant_chunk_id) pair taken directly from one
of those two files -- never fabricated, never guessed. Hard negatives are
mined using the EXISTING production retrieval index (BM25 + the current
all-MiniLM-L6-v2 dense index), not chosen at random, per four strategies:

  same_act_nearby   a different chunk from the same source, close to the
                     positive in document order (same chapter/cluster) --
                     e.g. bsa:121 as a negative for bsa:122's positive.
  boilerplate        the source's own unit "1" ("Short title, extent and
                     commencement") chunk, if it isn't the positive itself --
                     the generalizable dense false-positive pattern found
                     during this project's citizen-language evaluation
                     (see docs/RETRIEVAL_EVALUATION.md).
  bm25_strong_wrong  a chunk that ranks in the query's top-10 BM25 results
                     but is NOT one of the query's relevant chunks.
  dense_strong_wrong same, but for the top-10 DENSE results under the
                     current production model -- these are exactly the
                     "semantically similar but legally incorrect" decoys
                     the current model needs to learn to separate from the
                     true positive.

Queries are grouped before splitting so that near-duplicate queries (the
same question asked in both eval sets, confirmed by direct textual
comparison -- see _SAME_CONCEPT_GROUPS below) always land in the same
split; no query group is allowed to span train/val/test.
"""
from __future__ import annotations

import json
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.retrieval import search as search_mod  # noqa: E402
from app.retrieval.query_expand import expand_query  # noqa: E402

REPO_AI_ROOT = os.path.join(os.path.dirname(__file__), "..")
QUERIES_OLD = os.path.join(REPO_AI_ROOT, "eval", "queries.jsonl")
QUERIES_NEW = os.path.join(REPO_AI_ROOT, "eval", "queries_human.jsonl")
OUT_DIR = os.path.join(os.path.dirname(__file__), "data")

RANDOM_SEED = 42
TRAIN_FRAC = 0.70
VAL_FRAC = 0.15
# test gets the remainder

# Near-duplicate query pairs across the two eval sets, identified by direct
# authorship comparison (not automated) -- each pair asks essentially the
# same question about the same target chunk(s), so they must never be split
# across train/val/test or the "held-out" test set would leak information
# seen during training. Grouped by (old_id, new_id).
_SAME_CONCEPT_PAIRS = [
    ("q17", "h040"),  # ex post facto (constitution:20), same target, near-identical framing
    ("q18", "h041"),  # due process (constitution:21)
    ("q20", "h108"),  # freedom of speech (constitution:19) vs Art 105/194 decoys
    ("q46", "h098"),  # constitution:15 + pwdva:3, explicitly kept as the same hard case
    ("q47", "h106"),  # estoppel of a tenant (bsa:122) vs bsa:121 decoy
    ("q48", "h107"),  # adult bail (bnss:480) vs JJ Act decoy
    ("q23", "h076"),  # exact text duplicate: "how do I file an FIR"
]


def load_all_positives() -> list[dict]:
    """Returns one row per (query, positive_chunk_id) pair, flattening
    multi-source queries into one row per relevant chunk."""
    rows = []
    for path, tag in [(QUERIES_OLD, "orig"), (QUERIES_NEW, "human")]:
        with open(path, encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                q = json.loads(line)
                if q["expect_abstain"]:
                    continue
                for chunk_id in q["relevant_chunk_ids"]:
                    rows.append(
                        {
                            "query_id": f"{tag}:{q['id']}",
                            "query": q["query"],
                            "positive": chunk_id,
                            "category": q["category"],
                        }
                    )
    return rows


def assign_query_groups(rows: list[dict]) -> dict[str, str]:
    """query_id -> group_id. Exact-text duplicates and known same-concept
    pairs share a group; everything else is its own group."""
    text_to_group: dict[str, str] = {}
    qid_to_group: dict[str, str] = {}
    for r in rows:
        key = r["query"].strip().lower()
        if key not in text_to_group:
            text_to_group[key] = r["query_id"]
        qid_to_group.setdefault(r["query_id"], text_to_group[key])

    # Union same-concept pairs (old_id has no "orig:" prefix in the pair list
    # above, so match on the numeric-id suffix).
    id_to_qid = {qid.split(":", 1)[1]: qid for qid in qid_to_group}
    for old_id, new_id in _SAME_CONCEPT_PAIRS:
        if old_id in id_to_qid and new_id in id_to_qid:
            old_qid, new_qid = id_to_qid[old_id], id_to_qid[new_id]
            group = qid_to_group[old_qid]
            qid_to_group[new_qid] = group

    return qid_to_group


def _manifest_by_source() -> dict[str, list[dict]]:
    manifest = search_mod._load_chunk_manifest()
    by_source: dict[str, list[dict]] = {}
    for row in manifest:
        by_source.setdefault(row["source_id"], []).append(row)
    return by_source


def _same_act_nearby(positive: str, all_positives_for_query: set[str], by_source: dict, window: int = 6, n: int = 2) -> list[str]:
    source_id, _ = positive.split(":", 1)
    rows = by_source.get(source_id, [])
    ids = [r["chunk_id"] for r in rows]
    if positive not in ids:
        return []
    idx = ids.index(positive)
    candidates = ids[max(0, idx - window) : idx] + ids[idx + 1 : idx + 1 + window]
    candidates = [c for c in candidates if c != positive and c not in all_positives_for_query]
    random.shuffle(candidates)
    return candidates[:n]


def _boilerplate_negative(positive: str, all_positives_for_query: set[str]) -> list[str]:
    source_id, _ = positive.split(":", 1)
    candidate = f"{source_id}:1"
    if candidate != positive and candidate not in all_positives_for_query:
        return [candidate]
    return []


def _retrieval_strong_wrong(query: str, all_positives_for_query: set[str], score_fn, top_n: int = 10, n: int = 2) -> list[str]:
    expanded = expand_query(query)
    scores = score_fn(expanded)
    ranked = search_mod._ranked_ids(scores, limit=top_n, positive_only=(score_fn is search_mod._bm25_scores))
    candidates = [c for c in ranked if c not in all_positives_for_query]
    return candidates[:n]


def build_triplets(rows: list[dict]) -> list[dict]:
    by_source = _manifest_by_source()
    positives_by_query: dict[str, set[str]] = {}
    for r in rows:
        positives_by_query.setdefault(r["query_id"], set()).add(r["positive"])

    triplets = []
    for r in rows:
        qid, query, positive = r["query_id"], r["query"], r["positive"]
        own_positives = positives_by_query[qid]

        neg_sets: list[tuple[str, list[str]]] = [
            ("same_act_nearby", _same_act_nearby(positive, own_positives, by_source)),
            ("boilerplate", _boilerplate_negative(positive, own_positives)),
            ("bm25_strong_wrong", _retrieval_strong_wrong(query, own_positives, search_mod._bm25_scores)),
            ("dense_strong_wrong", _retrieval_strong_wrong(query, own_positives, search_mod._dense_scores)),
        ]
        seen_negs: set[str] = set()
        for neg_type, negs in neg_sets:
            for neg in negs:
                if neg in seen_negs:
                    continue
                seen_negs.add(neg)
                triplets.append(
                    {
                        "query_id": qid,
                        "query": query,
                        "positive": positive,
                        "negative": neg,
                        "neg_type": neg_type,
                        "category": r["category"],
                    }
                )
    return triplets


def split_by_group(rows: list[dict], qid_to_group: dict[str, str]) -> tuple[list[dict], list[dict], list[dict]]:
    groups = sorted(set(qid_to_group.values()))
    rng = random.Random(RANDOM_SEED)
    rng.shuffle(groups)
    n = len(groups)
    n_train = int(n * TRAIN_FRAC)
    n_val = int(n * VAL_FRAC)
    train_groups = set(groups[:n_train])
    val_groups = set(groups[n_train : n_train + n_val])
    test_groups = set(groups[n_train + n_val :])

    def group_of(row):
        return qid_to_group[row["query_id"]]

    train = [r for r in rows if group_of(r) in train_groups]
    val = [r for r in rows if group_of(r) in val_groups]
    test = [r for r in rows if group_of(r) in test_groups]
    return train, val, test


def main() -> None:
    random.seed(RANDOM_SEED)
    positives = load_all_positives()
    qid_to_group = assign_query_groups(positives)
    n_groups = len(set(qid_to_group.values()))
    print(f"Loaded {len(positives)} (query, positive) pairs across {n_groups} query groups "
          f"({len(positives) - n_groups} pairs merged into an existing group by near-duplication).")

    triplets = build_triplets(positives)
    print(f"Mined {len(triplets)} (query, positive, hard_negative) triplets.")
    from collections import Counter
    print("By neg_type:", Counter(t["neg_type"] for t in triplets))

    train, val, test = split_by_group(triplets, qid_to_group)
    print(f"Split: train={len(train)} val={len(val)} test={len(test)} triplets")

    # Leakage check: no query_id's group should appear in more than one split.
    def groups_in(rows):
        return {qid_to_group[r["query_id"]] for r in rows}

    assert not (groups_in(train) & groups_in(val)), "train/val group leakage"
    assert not (groups_in(train) & groups_in(test)), "train/test group leakage"
    assert not (groups_in(val) & groups_in(test)), "val/test group leakage"
    print("Leakage check passed: no query group spans more than one split.")

    os.makedirs(OUT_DIR, exist_ok=True)
    for name, split_rows in [("train", train), ("val", val), ("test", test)]:
        path = os.path.join(OUT_DIR, f"{name}.jsonl")
        with open(path, "w", encoding="utf-8") as f:
            for row in split_rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
        print(f"Wrote {path} ({len(split_rows)} rows)")


if __name__ == "__main__":
    main()
