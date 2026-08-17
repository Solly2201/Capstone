# Retrieval evaluation: BM25 vs dense vs hybrid

This records how CAP decided to move from BM25-only retrieval to hybrid
(BM25 + dense + Reciprocal Rank Fusion) retrieval, with real measurements
against this project's actual ingested corpus -- not a synthetic
benchmark, and not added because "hybrid sounds better." See
`docs/PROJECT_STATE.md` for where this sits in the project timeline and
`docs/ARCHITECTURE.md` for how it fits the overall pipeline.

**No generative LLM is involved anywhere in this evaluation or in what
it evaluates.** `services/ai/eval/run_eval.py` calls only
`app.retrieval.search` and `app.generation.pipeline.handle_legal_query`
-- both pure-retrieval/deterministic. Reproduce any number below with:

```bash
cd services/ai
python scripts/ingest_corpus.py            # rebuild bm25.pkl + dense_vectors.npy
python eval/run_eval.py                    # bm25 vs dense vs hybrid, top_k=5
python eval/run_eval.py --mode hybrid --top-k 10
python eval/run_eval.py --json eval/last_run.json   # full per-query dump
```

## Evaluation set

> **Since updated:** `eval/queries.jsonl` now has 49 queries covering
> all 9 ingested sources (added `ambiguous` and `source_specific`
> categories; RTI is excluded except as an abstain-expected control).
> The set and counts below describe the original evaluation this
> document records, at the point BM25 vs hybrid was decided -- see
> `docs/PROJECT_STATE.md`'s "Retrieval/evaluation hardening" for the
> current set and its results.

`services/ai/eval/queries.jsonl` -- 30 hand-curated queries against the
actually-ingested corpus (395 chunks across Constitution, BNS, BNSS,
BSA as of this evaluation), each with a hand-verified ground-truth
`relevant_chunk_ids` set (checked against the real chunk text, not
guessed) or `expect_abstain: true`. Categories:

| Category | Count | Tests |
| --- | --- | --- |
| `direct_lexical` | 11 | Exact section-title / term matches -- the case BM25 should win outright |
| `paraphrase` | 8 | Synonym-heavy rephrasing with low direct term overlap -- the case dense embeddings exist for |
| `distractor` | 1 | A query with a strong lexical false-friend elsewhere in the corpus (see "Article 19 vs 105" below) |
| `multi_source` | 2 | Evidence genuinely spans more than one source |
| `abstain_expected` | 7 | Topics documented as NOT yet ingested (FIR, bail, compounding, theft/robbery, burden of proof) plus two fully out-of-domain control queries ("best restaurants in mumbai", "how to bake a chocolate cake") |

Retrieval-quality metrics (Recall@5, Precision@5, MRR, nDCG@5,
top-1 citation correctness) are computed only over the 23 non-abstain
queries, since precision/recall against an empty ground-truth set is
undefined. Abstention accuracy is computed over all 30 queries by
running the full `handle_legal_query()` pipeline (Risk/UPL -> retrieval
-> confidence gate), separately per mode via `RETRIEVAL_MODE`.

## Baseline: BM25-only

First measurement, before any dense/hybrid code existed:

| Metric | Value |
| --- | --- |
| Recall@5 | 0.51 |
| MRR | 0.46 |
| nDCG@5 | 0.45 |
| Top-1 citation correctness | 0.39 |
| Abstention accuracy | 0.77 (but see below) |

The abstention number is misleading in isolation: BM25's raw score has
no absolute meaning (it's an unbounded, corpus-relative sum of
per-term weights), so `DEFAULT_MIN_SCORE_BY_MODE["bm25"] = 3.0` cannot
distinguish "genuinely uncovered legal topic" from "completely
off-topic query." Every one of the 7 `abstain_expected` queries --
including the two fully out-of-domain control queries -- scored above
the floor and got a confident-looking answer with a real (but
irrelevant) citation attached. This is the exact failure this project
already flagged before hybrid work started (see the `DEFAULT_MIN_SCORE`
docstring history in `app/generation/pipeline.py`): a wrong-topic
citation shown as if authoritative is a worse failure than abstaining,
in a legal-information context.

## A real bug found along the way: titles weren't indexed

The first hybrid pass revealed that `app/ingestion/index_build.py` only
ever tokenized `chunk.text` (the section body), never `chunk.title`
("Estoppel", "Right of private defence of body and of property") --
even though titles are exactly the vocabulary a citizen is likely to
search with, and the chunker (`app/ingestion/chunk.py`) deliberately
keeps titles out of the body it stores. A single-word query like
"estoppel" could miss BSA s.121 entirely, because the word "estoppel"
never recurs inside the section's own body text.

Fix: `app/ingestion/index_build._index_text()` now indexes
`"{title}. {text}"` (title included only for matching -- the excerpt
shown to a citizen is still exactly `chunk.text`, unchanged, preserving
the no-fabrication/verbatim-text guarantee). This alone raised the BM25
baseline from Recall@5 0.51 -> 0.62.

A second bug compounded the first: BM25 tokenization split on
whitespace only (`text.lower().split()`), so `"Estoppel."` (title,
period glued on by the `"{title}. {text}"` join) never matched a query
token `"estoppel"`. Fixed by extracting `\w+` word runs in a single
shared tokenizer (`app/retrieval/tokenize.py`) used identically at
index-build time and query time, so the two can never drift out of
sync again. This raised the BM25 baseline further, to Recall@5 0.79.

Both fixes apply to every mode (BM25, dense, hybrid) since they're
upstream of all three -- the numbers throughout this document are
post-fix.

## Dense retrieval

`sentence-transformers/all-MiniLM-L6-v2` (384-dim, local, no paid API),
L2-normalized at encode time so cosine similarity is a plain dot
product at query time (`app/retrieval/embeddings.py`). Persisted as
`data/index/dense_vectors.npy`, row-aligned with
`data/index/chunk_manifest.jsonl`. At ~400 chunks, brute-force
`vectors @ query_vector` is sub-millisecond -- no FAISS/ANN index is
used or needed at this corpus size (see "Why no FAISS" below).

| Metric | Value |
| --- | --- |
| Recall@5 | 0.86 |
| MRR | 0.83 |
| nDCG@5 | 0.83 |
| Top-1 citation correctness | 0.83 |
| Abstention accuracy | 0.80 (threshold 0.45, tuned -- see below) |

Dense alone beats BM25 alone on every quality metric here, expected
given 8 of 23 queries are deliberately synonym-heavy paraphrases. It
also abstains far more sensibly than raw BM25 once its threshold is
tuned, because cosine similarity is bounded and comparable across
queries in a way an unbounded BM25 score is not.

## Hybrid: Reciprocal Rank Fusion

`app/retrieval/fusion.py` implements (weighted) RRF: each ranked list
contributes `weight / (k + rank)` per item; an item missing from a list
contributes nothing from it (no invented score). Both candidate lists
are capped to the top 50 per method before fusion (`app/retrieval/
search.py`'s `_FUSION_CANDIDATE_POOL`) -- items past ~50th barely move
a `1/(k+rank)` term at the k values used here, so this bounds fusion
cost without changing which chunks can plausibly reach the final
top-`k`.

**k=60 (the RRF paper's standard default, tuned for thousand-document
web-search candidate pools) measurably underperformed plain dense
retrieval here.** A parameter sweep across `k in {5,8,10,15,30,60}` and
a dense weight in `{1, 1.3, 1.5, 1.8, 2, 2.5, 3}` (BM25 weight fixed at
1.0) against this project's 23 scored queries found:

- k=60, unweighted: Recall@5 0.75, MRR 0.61 -- **worse than dense alone
  on every metric**, because at that scale a document's exact rank
  barely moves its fusion contribution, so fusion collapses toward
  noise rather than combining genuine signal from both methods.
- **k=5, BM25 weight 1.0, dense weight 2.0** (the values now in
  `app/retrieval/fusion.py`'s `DEFAULT_RRF_K` / `DEFAULT_DENSE_WEIGHT`):
  clearly and consistently the best fit at this corpus size.

Final hybrid numbers, k=5 / dense-weighted 2x:

| Metric | BM25 | Dense | Hybrid |
| --- | --- | --- | --- |
| Recall@5 | 0.79 | 0.86 | **0.94** |
| Precision@5 | 0.22 | 0.19 | 0.21 |
| MRR | 0.69 | 0.83 | 0.82 |
| nDCG@5 | 0.69 | 0.83 | **0.84** |
| Top-1 citation correctness | 0.61 | 0.83 | 0.74 |
| Abstention accuracy | 0.77 | 0.80 | **0.83** |

**Hybrid beats the BM25 baseline on every single metric**, and beats
plain dense on recall, nDCG, and abstention accuracy while trading
away a little top-1 precision. That trade-off is acceptable for this
product specifically because the legal-answer pipeline shows every
retrieved excerpt in the response window, never just the top-1 result
merged into a single answer (`app/generation/pipeline.py`'s
`build_legal_answer` returns one `Excerpt` per retrieved chunk) -- so
"is the right law somewhere in the returned set" (recall) matters more
to what a citizen actually sees than "is it ranked first" (top-1
precision). This is why `tests/test_retrieval.py::
test_search_finds_arrest_provision_for_sunset_query` asserts the
correct section appears in the top-5 window rather than strictly at
rank 0 -- see that test's docstring.

### Why the fused RRF score can't gate confidence

An early version gated the confidence threshold on the fused RRF score
itself, using a placeholder cutoff. Measurement showed this was
unusable: on this corpus, a query's single top-ranked hybrid result
scores in a narrow ~0.027-0.033 band **regardless of whether the query
is genuinely covered by the corpus** -- RRF's score reflects a
candidate's rank position within a small pool, not its absolute
semantic relevance, so "ranked first among 50 candidates" stays true
even for a nonsense query. Every one of BM25's original 7 false
positives still passed at any reasonable RRF threshold.

Fix: `app/generation/pipeline._passes_confidence_gate()` gates hybrid
results on the top hit's `dense_score` (bounded, and the best-separated
signal measured) instead of its fused score, while still using the
fused ranking to decide *which* chunks are top hits. Threshold sweeps
against the labeled eval set (`DEFAULT_MIN_SCORE_BY_MODE`):

- `dense`: 0.45 (false_answer: bail/compounding/burden-of-proof
  near-misses; false_abstain: 2-3 borderline paraphrases)
- `hybrid`: 0.40 (false_answer: same 3 near-miss legal topics;
  false_abstain: 2 borderline paraphrases)

Both remaining false-answer categories (q24 "bail procedure", q25
"compounding of offences", q27 "burden of proof") are queries where the
corpus has genuinely adjacent-but-not-actually-relevant content (e.g.
BNSS s.39's non-cognizable-arrest discretion is topically near "bail"
without being bail procedure) -- a harder problem than threshold
tuning can fully solve, and a known, documented limitation rather than
a silent gap (see "Remaining limitations" below).

### The Article 19 vs 105 distractor case

Query "freedom of speech and expression" (q20) is designed to expose a
real corpus quirk: Constitution Article 105 ("freedom of speech in
**Parliament**") and Article 194 (same, for state legislatures) are
strong *lexical* false friends for the actual fundamental-rights
provision, Article 19(1)(a). Under BM25 alone and dense alone, Article
19 loses to these distractors. Hybrid fusion corrected this case --
neither signal alone was enough, but combining BM25's confidence that
19 contains the phrase with dense's semantic read pulled it back to a
correct top rank. This is the one concrete example in this evaluation
of hybrid fusion fixing an error neither individual method resolved.

## Why no FAISS

`docs/ARCHITECTURE.md`'s original service diagram named FAISS
alongside BM25. At ~400 chunks, brute-force NumPy cosine similarity
(`vectors @ query_vector`, all 395 rows) runs in well under a
millisecond -- an approximate-nearest-neighbor index exists to avoid
scanning millions of vectors, which does not describe this corpus.
Adding FAISS now would mean a second native binary dependency
(`faiss-cpu`) for zero measured benefit. If the corpus grows by
orders of magnitude (full BNS/BNSS/BSA ingestion, additional Acts),
revisit this -- `app/retrieval/embeddings.py` and the persisted
`dense_vectors.npy` format were kept swap-compatible with an ANN index
specifically so that migration wouldn't require touching the
generation/pipeline layer above it.

## Reranking: deferred, not added

The target architecture diagram includes an optional reranker stage.
It was deliberately **not** added this iteration. Reasoning:

1. Hybrid already beats the BM25 baseline on every metric measured,
   which was this evaluation's actual mandate -- a reranker's job would
   be to improve on hybrid specifically, and that's a separate,
   unproven claim.
2. Inspecting the remaining misses (`eval/last_run.json`, e.g. q06, q07,
   q16 at full-corpus rank 8-25) showed most are not "the right answer
   is a few ranks too low in an otherwise-good candidate list" --
   exactly the shape of problem a reranker fixes -- but genuine
   embedding-model/vocabulary gaps (a general-purpose 384-dim model
   with no legal-domain fine-tuning under-weighting formal statute
   phrasing against a conversational paraphrase). A cross-encoder
   reranker over the existing candidates would not obviously fix that;
   better legal-domain embeddings or corpus growth would.
3. A reranker adds real cost (a second model, extra inference latency
   per query) for a v1 capstone system at ~400 chunks, where that cost
   is harder to justify than it would be at production scale.

If corpus growth or future evaluation shows the remaining top-5 misses
are actually reranking-shaped (correct chunk present but consistently
mis-ordered within a decent candidate pool), add a lightweight local
cross-encoder (e.g. `cross-encoder/ms-marco-MiniLM-L-6-v2`) as an
optional stage after fusion, gated the same way dense retrieval is
(available-if-installed, degrade gracefully if not) -- not before that
evidence exists.

## Query preprocessing: mostly deferred, one narrow exception added

No general synonym expansion, spelling correction, or query rewriting
was added. This section's original conclusion held for a while: the
paraphrase category in this evaluation tests whether the *retrieval
methods themselves* (dense embeddings specifically) handle vocabulary
variation without needing a preprocessing layer, and hybrid's
paraphrase-query results were adequate without one.

The stated trigger condition -- "revisit only if future evaluation
queries expose failures specifically attributable to ... abbreviations"
-- was met after the corpus expanded to include BNSS's FIR chapter
(ss.173-196): "how do I file an FIR" false-abstained, because "FIR"
(the term nearly every citizen actually uses) appears almost nowhere
in BNSS's own statutory text (s.173 is titled "Information in
cognizable cases" and never uses the abbreviation). `app/retrieval/
query_expand.py` was added specifically for this: a fixed dict of 2
well-established Indian legal abbreviations (FIR, NCR), expanded by
*appending* the spelled-out form to the query at search time so the
original tokens are preserved. This is not a general synonym model, a
misspelling corrector, or a reranker -- it is the same narrow,
evaluation-justified exception the original deferral decision always
allowed for, and should stay that narrow unless evaluation names
another specific gap.

## Remaining limitations

- The confidence-gate thresholds (all three modes) are tuned against a
  49-query hand-curated set (`eval/queries.jsonl`, rebuilt to cover all
  9 ingested sources) over a 1,783-chunk corpus -- real floors, backed
  by real numbers, but still not statistically robust the way a much
  larger labeled eval set would be. Re-run `python eval/run_eval.py`
  and re-sweep after any significant corpus growth (see
  `docs/PROJECT_STATE.md`'s ingestion gaps).
- The hybrid floor was raised 0.40->0.42 after stress-testing
  out-of-domain queries against the expanded corpus found real false
  positives (see `docs/PROJECT_STATE.md`'s "Retrieval/evaluation
  hardening"). That raise is not a complete fix -- two of the three
  stress-test false positives found (both ~0.45) still clear even the
  raised floor, and closing that gap fully would cost a genuine query
  (q20, at 0.4531) under a single global threshold. A smarter
  out-of-domain signal, not another threshold nudge, is the likely
  actual fix, and hasn't been built.
- Bail, compounding of offences, and burden of proof -- the three
  near-miss topics this document originally flagged here -- are no
  longer near-misses: BNSS's bail chapter, s.359, and BSA's
  burden-of-proof sections are all now ingested, and all three now
  answer with a directly relevant citation (verified end to end, see
  `docs/PROJECT_STATE.md`). Two similarly-shaped topics (FIR, child in
  conflict with law) were also confirmed fixed the same way.
- Dense embeddings depend on the optional `sentence-transformers`
  install (`requirements-full.txt`); this environment's global
  TensorFlow/Keras install was incompatible with `transformers`'s TF
  integration path (`ValueError: ... Keras 3 ... not yet supported`).
  Worked around by setting `USE_TF=0` before the first `transformers`
  import (`app/retrieval/embeddings.py`) so only the PyTorch backend
  loads -- harmless in environments without TensorFlow installed at
  all, but worth knowing about if dense mode ever fails to import in a
  new environment.
