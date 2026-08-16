# Citizen Assistance Technology (CAP)

> Your rights. Your service. Your voice.

CAP is an India-focused citizen platform with three planned modules:

- **Learn:** plain-language legal awareness, sourced only from approved official material.
- **Civic report:** privacy-aware civic issue reporting with a simulated authority workflow.
- **Petitions:** public, community-led petitions and signatures.

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

## Increment 1

This increment establishes the monorepo, UI foundation, landing page, authentication/RBAC boundary, local-storage abstraction, Docker configuration, CI, seed accounts, and formal AI workflow. Legal RAG, civic reporting, petitions, and model inference are intentionally deferred to later increments.

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
6. For the legal corpus (Module 1A): from `services/ai/`, install `requirements.txt`, then run `python scripts/ingest_corpus.py` to build the searchable index from `services/ai/data/legal-corpus/`. Run the AI service with `uvicorn app.main:app --reload --port 8000`. To add or update a source, drop its raw text into `data/legal-corpus/<source_id>/raw.txt` and re-run the ingest script — see `docs/LEGAL_SOURCES.md` for what's currently ingested and what's still partial.
7. For legal answers (Module 1B, `POST /api/legal/answer` / `POST /legal/answer`): pure retrieval, no generative LLM anywhere in this path (standing project decision — see `docs/PROJECT_STATE.md`). A question runs through deterministic Risk/UPL checks, then the same BM25 index Module 1A uses, then a confidence gate; the response is the exact retrieved excerpt(s) with their citations, or an abstention/redirect message. Optional: `LEGAL_CHAT_MIN_SCORE` (retrieval-confidence floor, default `3.0`, provisional — see `services/ai/app/generation/pipeline.py`).

## Local demo accounts

These accounts are only for the local demonstration. All are pre-verified and have accepted the current legal-information disclaimer.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@cap.local` | `CAPAdmin!2026` |
| Authority | `authority@cap.local` | `CAPAuthority!2026` |
| Citizen | `citizen.aarav@cap.local` | `CAPCitizen!2026` |
| Citizen | `citizen.ananya@cap.local` | `CAPCitizen!2026` |

Replace these credentials and the JWT secret before any non-local deployment.

## Safety and source policy

- The legal assistant must answer only from retrieved, approved official sources and attach citations with a verification date.
- If evidence is missing, relevance is low, or the question seeks personalised legal advice, it must abstain and redirect to appropriate official support.
- High-risk situations (active crime, violence, harassment, domestic violence, child safety, self-harm, medical emergency, or cyber financial fraud) do not proceed to legal generation.
- Only Admins may access retained unblurred source images. Normal user-facing and Authority views use privacy-masked derivatives.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/LEGAL_SOURCES.md](docs/LEGAL_SOURCES.md).
