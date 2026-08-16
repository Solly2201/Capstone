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
- Increment 2 work (this file's latest update) is uncommitted in this patch — see the accompanying patch/diff for the exact file list.

## Completed

**Increment 1 — Foundation**
Monorepo, React+TS frontend, Tailwind, React Router, Node+Express backend, FastAPI AI-service boundary, auth/RBAC (Citizen/Authority/Admin), landing + login pages, shared contracts, Docker config, GitHub Actions CI, local storage abstraction, seed accounts, architecture + legal-source docs, basic tests.

**Increment 2 — Module 1A (legal ingestion + learning library), in progress**
- Ingestion pipeline: `services/ai/app/ingestion/` (extract → clean → chunk → version → persist). Chunking verified against known text (BNSS §43(5), Constitution Art. 21).
- Corrected a real corpus error: the supplied `BNSS.pdf` was a superseded bill draft; replaced with the enacted Act No. 46 of 2023 text from India Code.
- Hybrid retrieval: `services/ai/app/retrieval/search.py`. BM25 always built; dense embeddings (`sentence-transformers`) used if installed, else graceful degrade to lexical-only — this is recorded in `index_manifest.json`, never silently assumed.
- Folder-upload workflow: drop `raw.txt` into `services/ai/data/legal-corpus/<source_id>/`, run `python services/ai/scripts/ingest_corpus.py`. Nothing else needs to change to pick up new/updated source text.
- FastAPI endpoints: `GET /corpus/sources`, `GET /corpus/search`, `GET /corpus/sections/{source}/{unit}` — retrieval only, no LLM generation.
- Node proxy: `GET /api/corpus/*` forwards to the AI service, keeping the browser off the Python service directly.
- Frontend: `LearnPage`, `ArticlePage`, `DocumentBrowserPage` replace the `/learn` placeholder.
- 3 fully-grounded learning articles (`apps/web/src/content/learningArticles.ts`): Cognizable vs Non-Cognizable, Bailable vs Non-Bailable, What Happens When You're Arrested. Every paragraph cites an exact section.
- Tests: `services/ai/tests/test_ingestion.py`, `test_retrieval.py` (11 passing). Whole JS monorepo typechecks, existing tests pass, production build succeeds.

## Do NOT do yet

- Do not build the RAG chat (Module 1B) — no LLM generation anywhere in Module 1 yet, by design.
- Do not build Module 2 (civic reporting) or Module 3 (petitions).
- Do not write FIR/NCR or bail-procedure learning content — the source sections for those (BNSS ss.173-196, 478-496) are not ingested yet; writing that content now would mean citing sections that aren't actually in the corpus.
- Do not redesign the architecture without a concrete reason.
- Do not re-ask questions already answered in prior chat history — check the conversation/spec first.

## Known gaps / next steps for Increment 2

1. **BNSS**: ingest Chapter XIII (investigation/FIR, ss.173-196) and Chapter XXXV (bail and bonds, ss.478-496). The India Code PDF fetch tool used so far truncates around ~16K tokens per call, so this needs either a full-PDF upload from the user or several more targeted fetches.
2. **BNS**: ingest punishments (Ch. II), abetment (Ch. IV), offences against the human body (Ch. VI), and offences against property / theft-robbery (Ch. XVII) — needed for a "Common Offences" learning topic.
3. **BSA**: currently only a small excerpt (definitions, estoppel, witness privilege). Full evidence-procedure ingestion is future work, lower priority than BNS/BNSS for the citizen-facing learning topics already planned.
4. Once (1) is done: write FIR vs NCR and Bail Procedure learning articles.
5. Compoundable vs Non-compoundable Offences topic — needs BNSS section 359 (compounding of offences), not yet ingested.
6. Consider adding a lightweight admin UI (or at minimum a documented CLI step) for approving a new source before `ingest_corpus.py` will pick it up, per the "admin validates official origin before indexing" requirement — not built yet, currently enforced only by the `APPROVED_SOURCES` allow-list in code.
7. Dense embeddings are optional and untested in this environment (`sentence-transformers`/`faiss-cpu` not installed here) — verify `requirements-full.txt` installs cleanly in the real dev environment before relying on hybrid mode.

## Development philosophy (unchanged from Increment 1)

Work one increment at a time. Inspect the repo before changing anything. Preserve existing working functionality. Keep services modular and loosely coupled. After each increment, run typechecks/tests/builds and report exactly what was verified — never claim something works without having run it. Don't add technology (Kafka, Neo4j, Qdrant, PostGIS, voice, multilingual, etc.) unless the current increment actually needs it.
