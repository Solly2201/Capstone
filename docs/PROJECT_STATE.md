# Citizen Assistance Technology — Project State

This file is the "where am I?" doc. Read this before touching anything.
Update it at the end of every increment.

## Source of truth

- **Implementation state:** this Git repository. Don't assume a feature exists because a spec says it should — inspect the code.
- **Requirements:** the user's latest decisions win over the original CAP overview document when they conflict.
- **Law:** official India Code text only (see `docs/LEGAL_SOURCES.md`). Never a bill draft, never an unofficial mirror.
- **Design:** current product requirements win over any old screenshot/template.

## Current commit lineage

- `7971e01` — Increment 1 (foundation)
- `6c4ffe3` — Increment 2 / Module 1A (legal ingestion + learning library)
- `3dc2ced`, `343d22c` — Module 1B Batches 1–2, committed under an earlier generative design (see "Architecture pivot" below) — the confidence gate and abstention behavior from these commits survive into the current design; the LLM-provider code they also added does not.
- **Architecture pivot (75e2fff):** the legal-answer pipeline was rebuilt as pure retrieval + deterministic response. An LLM-generation direction (provider abstraction, a real Gemini integration verified against the live API, citation/index validation on generated text, prompt-injection defenses) was fully implemented and then deliberately discarded once weighed against hallucination risk in a legal-information context. **Standing decision: the legal-answer path never uses a generative LLM, full stop** — this is not a temporary state, and a future session should not reintroduce generation here without the user explicitly asking again.
- **Hybrid retrieval (8ac5123):** BM25-only retrieval was replaced with hybrid retrieval — BM25 + local dense embeddings (`sentence-transformers/all-MiniLM-L6-v2`), combined with weighted Reciprocal Rank Fusion — evaluated against a hand-curated 30-query set before and after, per `docs/RETRIEVAL_EVALUATION.md`. Hybrid beat the BM25 baseline on every measured metric (Recall@5 0.79→0.94, MRR 0.69→0.82, nDCG@5 0.69→0.84, top-1 citation correctness 0.61→0.74, abstention accuracy 0.77→0.83). Still pure retrieval — no generative LLM was added anywhere in this work; embeddings are retrieval infrastructure only.

## Completed

**Increment 1 — Foundation**
Monorepo, React+TS frontend, Tailwind, React Router, Node+Express backend, FastAPI AI-service boundary, auth/RBAC (Citizen/Authority/Admin), landing + login pages, shared contracts, Docker config, GitHub Actions CI, local storage abstraction, seed accounts, architecture + legal-source docs, basic tests.

**Increment 2 — Module 1A (legal ingestion + learning library)**
- Ingestion pipeline: `services/ai/app/ingestion/` (extract → clean → chunk → version → persist). Chunking verified against known text (BNSS §43(5), Constitution Art. 21).
- Corrected a real corpus error: the supplied `BNSS.pdf` was a superseded bill draft; replaced with the enacted Act No. 46 of 2023 text from India Code.
- Hybrid retrieval: `services/ai/app/retrieval/search.py`. BM25 always built (with a process-lifetime cache added in Module 1B, since chat calls it far more often than corpus browsing); dense embeddings (`sentence-transformers`) used if installed, else graceful degrade to lexical-only — this is recorded in `index_manifest.json`, never silently assumed.
- Folder-upload workflow: drop `raw.txt` into `services/ai/data/legal-corpus/<source_id>/`, run `python services/ai/scripts/ingest_corpus.py`. Nothing else needs to change to pick up new/updated source text.
- FastAPI endpoints: `GET /corpus/sources`, `GET /corpus/search`, `GET /corpus/sections/{source}/{unit}` — retrieval only, no LLM generation.
- Node proxy: `GET /api/corpus/*` forwards to the AI service, keeping the browser off the Python service directly.
- Frontend: `LearnPage`, `ArticlePage`, `DocumentBrowserPage` replace the `/learn` placeholder.
- 3 fully-grounded learning articles (`apps/web/src/content/learningArticles.ts`): Cognizable vs Non-Cognizable, Bailable vs Non-Bailable, What Happens When You're Arrested. Every paragraph cites an exact section.
- Tests: `services/ai/tests/test_ingestion.py`, `test_retrieval.py` (11 passing). Whole JS monorepo typechecks, existing tests pass, production build succeeds. AI test suite is now also enforced in CI (`.github/workflows/ci.yml`).

**Module 1B — Deterministic legal answers (no generative LLM)**
- `services/ai/app/generation/pipeline.py`: `handle_legal_query()` (Risk/UPL → retrieval → `build_legal_answer()`), the confidence gate (`LEGAL_CHAT_MIN_SCORE`, provisional — see its docstring for why no defensible cutoff exists in the current corpus/tokenization), and `build_legal_answer()` itself, which returns the verbatim retrieved chunk text plus real citations directly — no LLM call, no free text to validate, since nothing generates one.
- `services/ai/app/generation/context.py`: `distinct_sources()` only, repurposed as a grouping/labeling helper. Multiple or differing sources are returned as separate excerpts by construction (never merged into one synthesized paragraph), which is why the old design's "don't let the LLM merge conflicting sources" prompt instruction has no replacement — the problem it solved doesn't exist once nothing generates a paragraph.
- `services/ai/app/safety/`: deterministic Risk/UPL categories (self-harm, child safety, domestic violence, medical emergency, active crime, cyber fraud, personalized advice) — unchanged by the pivot, still runs before retrieval. `fabrication.py`'s pattern matcher was repurposed from a per-request runtime check into a one-time regression test (`test_template_safety.py`) against the small set of fixed, hand-written response strings, since nothing generates free text to check anymore. Prompt-injection detection (`safety/injection.py`) was removed entirely — it defended an LLM system prompt, and no prompt exists anywhere in this pipeline now.
- Endpoints: `POST /legal/answer` (AI service, public, disclaimer attached to every response) and its proxy `POST /api/legal/answer` (Node, own rate limiter, sized for cheap BM25 lookups rather than LLM-call cost).
- Removed entirely: `LLMProvider`/`MockLLMProvider`/`GeminiProvider`/`get_provider` (`generation/provider.py`, `generation/gemini_provider.py`), `requirements-gemini.txt`. This was real, tested integration work (the Gemini path was verified this session against the live API, including its failure path with an invalid key) — it is recorded here as history, not silently erased, but none of it ships.
- Tests: 39 AI-service tests (Module 1A + 1B), all pure-function or monkeypatched-retrieval — no provider/LLM mocking exists anywhere in the suite because there is nothing left to mock. Live-verified against the real corpus, including a genuine multi-source query (BNSS + Constitution) confirmed to return two separate, unmerged excerpts.

**Hybrid retrieval (BM25 + dense, RRF-fused)**
- `services/ai/app/retrieval/embeddings.py`: local dense-embedding wrapper (`sentence-transformers/all-MiniLM-L6-v2`, 384-dim, configurable via `DENSE_EMBEDDING_MODEL`), L2-normalized at encode time. `services/ai/app/retrieval/fusion.py`: weighted Reciprocal Rank Fusion (`k=5`, dense weighted 2x — deliberately tuned away from the RRF paper's k=60 default, which measurably underperformed at this corpus's ~400-chunk scale; see `docs/RETRIEVAL_EVALUATION.md`). `services/ai/app/retrieval/tokenize.py`: the one BM25 tokenizer, shared by index-build and query time (fixes a real bug found during evaluation — whitespace-only splitting left punctuation glued to words, e.g. `"estoppel."` never matching query token `"estoppel"`).
- `services/ai/app/retrieval/search.py`: `search(query, top_k, source_id, mode)` now supports `bm25` | `dense` | `hybrid` (auto-selects hybrid when a dense index exists); every result carries `retrieval_mode`, `bm25_score`/`bm25_rank`, and `dense_score`/`dense_rank` alongside the primary fused `score`, so fusion is inspectable without re-querying. Callers (including `generation/pipeline.py`) never need to know which mode produced a result — same cited-chunk dict shape throughout.
- `services/ai/app/ingestion/index_build.py`: now indexes `"{title}. {text}"` for both BM25 and dense (titles like "Estoppel" were previously never indexed at all, only body text — a second real bug found and fixed this session), while `Excerpt.text` shown to a citizen stays exactly the verbatim `chunk.text`, unchanged.
- `services/ai/app/ingestion/extract.py`: deterministic PDF text-layer extraction (`pypdf`, no OCR); `services/ai/app/ingestion/pipeline.py`'s `_ensure_raw_text()` auto-extracts a dropped `data/legal-corpus/<source_id>/raw.pdf` to `raw.txt` on first ingest, so an approved PDF can be dropped in directly instead of requiring hand-copied text.
- `services/ai/app/generation/pipeline.py`: confidence-gate floors are now per-mode (`DEFAULT_MIN_SCORE_BY_MODE`: bm25 3.0, dense 0.45, hybrid 0.40 — all evaluation-tuned). Hybrid gates on the top hit's `dense_score`, not its fused RRF score, because the fused score was measured to compress into a narrow, relevance-independent band on this corpus (see `docs/RETRIEVAL_EVALUATION.md`) — it decides ranking, not confidence.
- `services/ai/eval/`: `queries.jsonl` (30 hand-curated, hand-verified queries: direct-lexical, paraphrase, a lexical-distractor case, multi-source, and abstain-expected including out-of-domain controls) + `run_eval.py` (Recall@K, Precision@K, MRR, nDCG@K, top-1 citation correctness, abstention accuracy, per mode). Hybrid beat the BM25 baseline on every metric measured; full numbers and methodology in `docs/RETRIEVAL_EVALUATION.md`.
- Reranking and query preprocessing were both evaluated as candidates and explicitly deferred with documented reasoning (not silently skipped) — see `docs/RETRIEVAL_EVALUATION.md`'s "Reranking: deferred" and "Query preprocessing: deferred" sections.
- Tests: 57 AI-service tests (was 39) — added `test_fusion.py`, `test_extract.py`, `test_hybrid_retrieval.py`, plus new gate-behavior cases in `test_pipeline.py`. One pre-existing test (`test_search_finds_arrest_provision_for_sunset_query`) was changed from asserting strict rank-0 to asserting presence in the top-5 window, with a docstring explaining why (the product shows every returned excerpt, never just a single "best" one — see the test itself).
- Still pure retrieval, still no generative LLM anywhere: embeddings are retrieval infrastructure (ranking/matching), never answer generation.

## Do NOT do yet

- Do not build Module 2 (civic reporting) or Module 3 (petitions).
- Do not write FIR/NCR or bail-procedure learning content — the source sections for those (BNSS ss.173-196, 478-496) are not ingested yet; writing that content now would mean citing sections that aren't actually in the corpus.
- Do not redesign the architecture without a concrete reason.
- Do not re-ask questions already answered in prior chat history — check the conversation/spec first.

## Known gaps / next steps

**Module 1A corpus**
1. **BNSS**: ingest Chapter XIII (investigation/FIR, ss.173-196) and Chapter XXXV (bail and bonds, ss.478-496). The India Code PDF fetch tool used so far truncates around ~16K tokens per call, so this needs either a full-PDF upload from the user or several more targeted fetches.
2. **BNS**: ingest punishments (Ch. II), abetment (Ch. IV), offences against the human body (Ch. VI), and offences against property / theft-robbery (Ch. XVII) — needed for a "Common Offences" learning topic.
3. **BSA**: currently only a small excerpt (definitions, estoppel, witness privilege). Full evidence-procedure ingestion is future work, lower priority than BNS/BNSS for the citizen-facing learning topics already planned.
4. Once (1) is done: write FIR vs NCR and Bail Procedure learning articles.
5. Compoundable vs Non-compoundable Offences topic — needs BNSS section 359 (compounding of offences), not yet ingested.
6. Consider adding a lightweight admin UI (or at minimum a documented CLI step) for approving a new source before `ingest_corpus.py` will pick it up, per the "admin validates official origin before indexing" requirement — not built yet, currently enforced only by the `APPROVED_SOURCES` allow-list in code.
7. ~~Dense embeddings are optional and untested~~ — resolved this session: `requirements-full.txt` (`sentence-transformers`) installs and runs cleanly; hybrid mode is live and evaluated (`docs/RETRIEVAL_EVALUATION.md`). Note for future environments: this environment's global TensorFlow/Keras install initially broke `transformers`' TF integration path on import — worked around with `USE_TF=0` in `app/retrieval/embeddings.py`, harmless where TF isn't installed at all.

**Module 1B legal answers**
8. Same corpus gaps as above directly limit what can be answered — e.g. it will abstain on FIR/NCR or bail-procedure questions exactly like the document browser does, since neither layer has that text ingested. Three near-miss topics (bail, compounding of offences, burden of proof) can still pass the hybrid confidence gate with a topically-adjacent-but-not-quite-right citation because the corpus has partial nearby content — see `docs/RETRIEVAL_EVALUATION.md`'s "Remaining limitations".
9. ~~`LEGAL_CHAT_MIN_SCORE` provisional floor~~ — resolved this session: floors are now per-retrieval-mode (`DEFAULT_MIN_SCORE_BY_MODE` in `generation/pipeline.py`), each tuned against the new evaluation harness rather than guessed. Still not perfect (a 30-query eval set isn't statistically robust) — re-sweep after significant corpus growth.
10. ~~No retrieval evaluation harness~~ — resolved this session: `services/ai/eval/` (Recall@K, Precision@K, MRR, nDCG, abstention accuracy, top-1 citation correctness). It was used to justify moving from BM25-only to hybrid (BM25+dense, RRF-fused) with real before/after numbers, and to decide reranking is not yet justified (see `docs/RETRIEVAL_EVALUATION.md`).
11. No persisted audit log of policy decisions — deliberately deferred to the evaluation/hardening increment; current logging is application-level only.
12. Risk/UPL detection is a curated deterministic phrase/regex ruleset, not an exhaustive classifier — false negatives on rephrased risky queries are possible; this is the accepted v1 trade-off for staying rules-only (no ML/LLM classifier, per standing decision).
13. No query preprocessing (synonym expansion, misspelling correction) yet — evaluated as a candidate this session and deferred, since dense embeddings already handled the paraphrase-query test cases adequately without one (see `docs/RETRIEVAL_EVALUATION.md`'s "Query preprocessing: deferred"). Revisit only if future evaluation queries expose failures specifically attributable to misspellings/abbreviations.
14. Reranking (the architecture diagram's optional stage) was evaluated as a candidate and deferred with documented reasoning — hybrid already beat the BM25 baseline on every metric, and the remaining misses look like embedding-model/vocabulary gaps rather than reranking-shaped ranking-order problems. See `docs/RETRIEVAL_EVALUATION.md`'s "Reranking: deferred" for what would justify revisiting this.
15. No FAISS/ANN index — a deliberate choice, not an oversight: brute-force NumPy cosine similarity over ~400 chunks runs in sub-millisecond time, so an approximate-nearest-neighbor index has no measured benefit yet. `app/retrieval/embeddings.py` was kept swap-compatible with one for when/if the corpus grows by orders of magnitude.

## Development philosophy (unchanged from Increment 1)

Work one increment at a time. Inspect the repo before changing anything. Preserve existing working functionality. Keep services modular and loosely coupled. After each increment, run typechecks/tests/builds and report exactly what was verified — never claim something works without having run it. Don't add technology (Kafka, Neo4j, Qdrant, PostGIS, voice, multilingual, etc.) unless the current increment actually needs it.
