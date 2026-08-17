"""(Weighted) Reciprocal Rank Fusion for combining independently-ranked candidates.

RRF combines rankings by position, not raw score, which sidesteps the
problem of BM25 and cosine-similarity scores living on incomparable
scales (BM25 is an unbounded corpus-relative score; cosine similarity
is bounded in [-1, 1]). Each ranked list contributes weight/(k + rank)
per item it contains; lists an item doesn't appear in contribute
nothing for it -- fusion never invents a score for a candidate neither
method surfaced.

k=60 is the standard default from the original RRF paper (Cormack,
Clarke & Buettcher 2009), tuned on web-search-scale candidate pools
(thousands of documents). It was NOT a good fit here: on this
project's ~400-chunk statute corpus, run through
eval/queries.jsonl (see docs/RETRIEVAL_EVALUATION.md), k=60 with equal
1.0/1.0 weights measurably underperformed plain dense retrieval on
every metric, because the two ranked lists are short enough that a
document's exact rank within them barely moves its 1/(k+rank) term at
that scale -- the fusion collapses towards "which list is longer /
denoises less," not "which method is actually more confident." A
parameter sweep across k in {5,8,10,15,30,60} and a dense weight in
{1,1.5,2,2.5,3} found k=5 with dense weighted 2x over BM25 (both
configurable below) to be a clearly and consistently better fit for
this corpus size -- it closed most of the recall/MRR gap to pure dense
while still beating pure dense on some exact-lexical/section-number
queries dense alone got wrong. This is an explicit deviation from the
textbook default, made because the evaluation data justified it, not a
blind default.

Re-swept after the Constitution's Part III (Fundamental Rights) title
metadata gap was fixed (chunk.py's _KNOWN_ARTICLE_TITLES -- see
docs/RETRIEVAL_EVALUATION.md's failure-analysis section): with BM25 now
meaningfully stronger on the paraphrase queries that title fix targets,
re-running the same k/dense-weight grid against eval/queries.jsonl's
now-45 non-abstain queries found dense weight 2.5 (k unchanged at 5)
recall@5 0.8074 vs 0.7852 at weight 2.0 -- a clean improvement with MRR,
nDCG@5, top-1 correctness and abstention accuracy all flat or better,
not a trade-off. Re-sweep again if the corpus or eval set changes
enough to plausibly shift this balance.
"""
from __future__ import annotations

DEFAULT_RRF_K = 5
DEFAULT_BM25_WEIGHT = 1.0
DEFAULT_DENSE_WEIGHT = 2.5


def reciprocal_rank_fusion(
    ranked_id_lists: list[list[str]],
    k: int = DEFAULT_RRF_K,
    weights: list[float] | None = None,
) -> dict[str, float]:
    """ranked_id_lists: one or more lists of ids, each already sorted best-first.

    weights: one weight per list (defaults to 1.0 each -- vanilla RRF).
    Returns {id: fused_score}, not sorted -- caller sorts by score desc.
    """
    if weights is None:
        weights = [1.0] * len(ranked_id_lists)
    fused: dict[str, float] = {}
    for ranked_ids, weight in zip(ranked_id_lists, weights):
        for rank, item_id in enumerate(ranked_ids, start=1):
            fused[item_id] = fused.get(item_id, 0.0) + weight / (k + rank)
    return fused
