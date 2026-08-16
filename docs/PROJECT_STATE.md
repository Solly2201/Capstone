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
- **Architecture pivot (this update, uncommitted):** the legal-answer pipeline was rebuilt as pure retrieval + deterministic response. An LLM-generation direction (provider abstraction, a real Gemini integration verified against the live API, citation/index validation on generated text, prompt-injection defenses) was fully implemented and then deliberately discarded once weighed against hallucination risk in a legal-information context. **Standing decision: the legal-answer path never uses a generative LLM, full stop** — this is not a temporary state, and a future session should not reintroduce generation here without the user explicitly asking again.

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
7. Dense embeddings are optional and untested in this environment (`sentence-transformers`/`faiss-cpu` not installed here) — verify `requirements-full.txt` installs cleanly in the real dev environment before relying on hybrid mode.

**Module 1B legal answers**
8. Same corpus gaps as above directly limit what can be answered — e.g. it will abstain on FIR/NCR or bail-procedure questions exactly like the document browser does, since neither layer has that text ingested.
9. `LEGAL_CHAT_MIN_SCORE` (default 3.0) is a documented provisional floor, not a validated relevance measure — empirical testing showed off-topic queries can outscore genuine low-coverage topic queries under this corpus's unfiltered BM25 tokenization. Revisit if/when retrieval quality work (stopword filtering, reranking, or evaluated semantic/dense retrieval) happens.
10. No retrieval evaluation harness yet (Recall@K, Precision@K, MRR, nDCG, abstention accuracy, citation correctness by query category) — planned, not built. Semantic/vector retrieval and reranking are both explicitly deferred until this harness can justify them with real numbers, not added speculatively.
11. No persisted audit log of policy decisions — deliberately deferred to the evaluation/hardening increment; current logging is application-level only.
12. Risk/UPL detection is a curated deterministic phrase/regex ruleset, not an exhaustive classifier — false negatives on rephrased risky queries are possible; this is the accepted v1 trade-off for staying rules-only (no ML/LLM classifier, per standing decision).
13. No query preprocessing (synonym expansion, misspelling correction) yet — candidate low-risk additions once the evaluation harness (item 10) shows natural-language/synonym/misspelling queries actually need it.

## Development philosophy (unchanged from Increment 1)

Work one increment at a time. Inspect the repo before changing anything. Preserve existing working functionality. Keep services modular and loosely coupled. After each increment, run typechecks/tests/builds and report exactly what was verified — never claim something works without having run it. Don't add technology (Kafka, Neo4j, Qdrant, PostGIS, voice, multilingual, etc.) unless the current increment actually needs it.
