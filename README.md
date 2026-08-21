# Citizen Assistance Technology (CAP)

> Your rights. Your service. Your voice.

CAP is an India-focused citizen platform with three planned modules:

- **Learn:** plain-language legal awareness, sourced only from approved official material.
- **Civic report:** privacy-aware civic issue reporting with a simulated authority workflow.
- **Petitions:** public, community-led petitions with one signature per account and a simulated authority moderation workflow.

CAP provides public awareness and information only. It is not legal advice or legal representation. For real-world legal implications, contact a qualified legal adviser. In an immediate emergency, call **112**.

## Repository layout

```text
apps/web/                 React + TypeScript citizen-facing application
services/api/             Node + Express core application API
services/ai/              Python + FastAPI AI-service boundary
packages/contracts/       Shared API/domain contracts
docs/                     Architecture, workflow, source inventory
infra/                    Docker and local infrastructure configuration
```

## Current status

Increments 1-6 are complete. Increment 6's engineering hardening is verified against the live Docker stack, and the Learn module and the legal safety layer were expanded alongside it. `docs/PROJECT_STATE.md` is the authoritative record, including the full list of known gaps.

- **Foundation** (Increment 1): monorepo, UI foundation, landing page, authentication/RBAC boundary, local-storage abstraction, Docker configuration, CI and seed accounts.
- **Learn** (Increment 2 / Module 1A): official-source ingestion and hybrid retrieval (BM25 + local dense embeddings, RRF-fused), a document browser, and 71 grounded learning articles across twelve categories (Constitution and fundamental rights; police, FIR and complaints; arrest and bail; courts, trials and evidence; everyday citizen rights; consumer rights; digital and online rights; women’s safety and domestic violence; children and young people; legal aid and access to justice; civic participation; right to information), each ending in a short grounded quiz — 216 questions in total — plus 35 grounded "What should I do?" FAQs answering the practical questions citizens actually ask. Every paragraph cites the exact Article or section it was written against. The Right to Information Act 2005 is now ingested from the Central Information Commission’s published copy; that copy predates the RTI (Amendment) Act 2019, so sections 13, 16 and 27 are excluded rather than served as current law, and no RTI fee amount is stated anywhere because the Act leaves the figures to rules that are not ingested. Workplace/labour rights remain deferred because no labour legislation is ingested.
- **Legal answers** (Module 1B): `POST /api/legal/answer` runs a deterministic query-safety policy, hybrid retrieval and a confidence gate, then returns the exact retrieved text with citations or abstains. The safety policy grades a question as `normal`, `serious`, `emergency` or `harmful_request` by combining subject, framing and immediacy rather than matching keywords, so ordinary legal education is not blocked while a live emergency gets an official helpline and a request for help obstructing an investigation is refused. **No generative LLM is used anywhere in this path** — a standing project decision, not a temporary state.
- **Civic report** (Module 2): citizen reporting with metadata stripping before storage, plus the authority workflow — a declared transition table, server-controlled status history, staff-assigned priority with SLA deadlines, and an authority queue.
- **Petitions** (Module 3): petition lifecycle, one signature per account enforced by a unique database index, public browse and detail, and an authority moderation queue.

- **Engineering hardening** (Increment 6): token-version revocation with stored-role re-checks on privileged routes, production guards that refuse to boot with a placeholder `JWT_SECRET` or a wildcard CORS origin, redacted structured request logging, separate liveness and readiness health checks, graceful shutdown, a CPU-only PyTorch AI image, and `.dockerignore` files that cut the build contexts from 330 MB to 0.9 MB and 112 MB to 0.1 MB.

- **Product completion** (M10): deterministic civic duplicate handling — an exact-resubmission fingerprint (SHA-256 over reporter, category, normalised text, quantised location and an hourly bucket, enforced by a unique sparse index) plus a nearby-recent-same-category warning the citizen can override, never a refusal of an independent report; the Legal Assistant now links Learn articles and FAQs grounded in the very provisions it cited (an exact `sourceId:unitNumber` metadata join, no similarity model); petition and report screens resynchronise after a 409 instead of stranding stale state; the authority's formal petition response gets its own panel; the authority queues paginate and filter both goal directions; an ADMIN signature recount implements the documented count-drift recovery; and navigation, denial copy, session-expiry messaging and the 404 page are role- and reality-aware.

- **Session, mail, search and multi-turn context** (M11): a 7-day refresh token renews the 15-minute access token transparently (revocable via `tokenVersion`, stored role re-read on every refresh); verification email sends over any configured `SMTP_URL` (production registration refuses honestly when no transport exists); My Reports paginates; petitions gain deterministic free-text search; staff history shows acting staff names instead of raw ids; and the Legal Assistant resolves safe follow-up questions ("what if I'm a minor?") by deterministic composition with the previous question — shown back verbatim, guarded end-to-end, with clarification instead of guessing when a follow-up cannot be resolved. No LLM anywhere, measured 0/10 → 8/10 follow-up hit@5 on a corpus-verified eval set.

Not built: civic vision/ML, automatic categorisation or priority prediction, the petition recommendation agent, notifications and analytics.

## Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop (recommended; required for MongoDB and Redis containers)
- Python 3.11+ (for the AI service)

## Local development

1. Copy `services/api/.env.example` to `services/api/.env` and adjust values if required.
2. Install JavaScript dependencies with `npm install`.
3. Start MongoDB and Redis with `docker compose up -d mongo redis`.
4. Run the API with `npm run dev:api` and the web app with `npm run dev:web`.
5. Seed demo users with `npm run seed -w @cap/api`.
6. For the legal corpus (Module 1A): from `services/ai/`, install `requirements.txt` (BM25-only) or `requirements-full.txt` (adds local dense embeddings for hybrid retrieval — `sentence-transformers`, no paid API), then run `python scripts/ingest_corpus.py` to build the searchable index from `services/ai/data/legal-corpus/`. Run the AI service with `uvicorn app.main:app --reload --port 8000`. To add or update a source, drop its raw text (or a PDF — `raw.pdf` is extracted to `raw.txt` automatically on first ingest) into `data/legal-corpus/<source_id>/` and re-run the ingest script — see `docs/LEGAL_SOURCES.md` for what's currently ingested and what's still partial, and `docs/RETRIEVAL_EVALUATION.md` for how hybrid retrieval (BM25 + dense, RRF-fused) was evaluated against a BM25-only baseline.
7. For legal answers (Module 1B, `POST /api/legal/answer` / `POST /legal/answer`): pure retrieval, no generative LLM anywhere in this path (standing project decision — see `docs/PROJECT_STATE.md`). A question runs through deterministic Risk/UPL checks, then hybrid retrieval (BM25 + dense, falling back to BM25-only if `requirements-full.txt` isn't installed), then a mode-aware confidence gate; the response is the exact retrieved excerpt(s) with their citations, or an abstention/redirect message. Optional: `RETRIEVAL_MODE` (`bm25` | `dense` | `hybrid`, default auto), `LEGAL_CHAT_MIN_SCORE` (overrides the confidence floor for whichever mode is active — see `services/ai/app/generation/pipeline.py`'s `DEFAULT_MIN_SCORE_BY_MODE` for the per-mode, evaluation-tuned defaults).
8. To re-run the retrieval evaluation (BM25 vs dense vs hybrid, Recall@K/Precision@K/MRR/nDCG/citation correctness/abstention accuracy) after any corpus or retrieval change: `python services/ai/eval/run_eval.py`.

## Local demo accounts

**Development only.** These accounts exist so a reviewer can sign in against a local stack; they are created by `npm run seed -w @cap/api`, which refuses to run when `NODE_ENV=production`. All are pre-verified and have accepted the current legal-information disclaimer. Never seed them into a deployed environment.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@cap.local` | `CAPAdmin!2026` |
| Authority | `authority@cap.local` | `CAPAuthority!2026` |
| Citizen | `shreshtha.bindal26@nmims.in` | `CapStone@22!` |
| Citizen (test) | `user@test.com` | `CapStone@22!` |

Replace these credentials and the JWT secret before any non-local deployment. The API enforces the second half of that: under `NODE_ENV=production` it refuses to start while `JWT_SECRET` is still the development placeholder.

## Safety and source policy

- The legal assistant must answer only from retrieved, approved official sources and attach citations with a verification date.
- If evidence is missing, relevance is low, or the question seeks personalised legal advice, it must abstain and redirect to appropriate official support.
- High-risk situations (active crime, violence, harassment, domestic violence, child safety, self-harm, medical emergency, or cyber financial fraud) do not proceed to legal generation.
- Only Admins may access retained unblurred source images. Normal user-facing and Authority views use privacy-masked derivatives.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/LEGAL_SOURCES.md](docs/LEGAL_SOURCES.md), and [docs/RETRIEVAL_EVALUATION.md](docs/RETRIEVAL_EVALUATION.md).
