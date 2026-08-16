from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from .generation.disclaimer import DISCLAIMER_TEXT, DISCLAIMER_VERSION
from .generation.pipeline import handle_legal_query
from .ingestion.sources import APPROVED_SOURCES
from .retrieval.search import get_section, search

app = FastAPI(
    title="CAP AI Service",
    version="0.1.0",
    description="Service boundary for CAP's later RAG, vision, safety and evaluation pipelines.",
)


class ReadinessResponse(BaseModel):
    status: str
    service: str
    enabled_capabilities: list[str]


@app.get("/health", response_model=ReadinessResponse)
def health_check() -> ReadinessResponse:
    return ReadinessResponse(
        status="ok",
        service="cap-ai",
        enabled_capabilities=[
            "service-boundary",
            "corpus-ingestion",
            "corpus-retrieval",
            "legal-answer",
        ],
    )


# --- Module 1A: legal corpus browser -----------------------------------
# Retrieval only. No LLM generation happens anywhere in this service --
# see the standing "no generative LLM in the legal-answer pipeline"
# decision in docs/PROJECT_STATE.md. Module 1B (below) wraps this same
# retrieval layer with Risk/UPL and a confidence gate; it never adds
# generation on top of it.

class SourceSummary(BaseModel):
    source_id: str
    display_name: str
    act_no: str
    official_url: str
    as_on_date: str
    coverage_note: str
    unit_label: str


@app.get("/corpus/sources", response_model=list[SourceSummary])
def list_sources() -> list[SourceSummary]:
    return [
        SourceSummary(
            source_id=s.source_id,
            display_name=s.display_name,
            act_no=s.act_no,
            official_url=s.official_url,
            as_on_date=s.as_on_date,
            coverage_note=s.coverage_note,
            unit_label=s.unit_label,
        )
        for s in APPROVED_SOURCES.values()
    ]


class SearchResult(BaseModel):
    chunk_id: str
    score: float
    text: str
    title: str
    citation: dict
    coverage_note: str


@app.get("/corpus/search", response_model=list[SearchResult])
def search_corpus(
    q: str = Query(..., min_length=2, description="Search text"),
    source: str | None = Query(default=None, description="Restrict to one source_id"),
    top_k: int = Query(default=5, ge=1, le=20),
) -> list[SearchResult]:
    if source is not None and source not in APPROVED_SOURCES:
        raise HTTPException(status_code=400, detail=f"Unknown source '{source}'")
    try:
        results = search(q, top_k=top_k, source_id=source)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return [SearchResult(**r) for r in results]


class SectionDetail(BaseModel):
    chunk_id: str
    text: str
    title: str
    citation: dict
    coverage_note: str


@app.get("/corpus/sections/{source_id}/{unit_number}", response_model=SectionDetail)
def get_section_detail(source_id: str, unit_number: str) -> SectionDetail:
    if source_id not in APPROVED_SOURCES:
        raise HTTPException(status_code=404, detail=f"Unknown source '{source_id}'")
    result = get_section(source_id, unit_number)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"{source_id}:{unit_number} not found -- it may not be ingested yet "
            f"(see coverage_note on /corpus/sources).",
        )
    return SectionDetail(**result)


# --- Module 1B: deterministic legal answers -----------------------------
# Risk/UPL -> retrieval -> confidence gate -> deterministic response, per
# docs/ARCHITECTURE.md. No generative LLM anywhere in this path -- every
# excerpt returned is the verbatim retrieved chunk text with its real
# citation. Public endpoint (no auth) by deliberate v1 decision -- basic
# legal information should not require an account -- so the disclaimer
# is attached to every response rather than relying on account-level
# acceptance at registration.


class LegalQueryRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000)


class LegalExcerpt(BaseModel):
    chunk_id: str
    text: str
    source: str
    act_no: str
    unit: str
    official_url: str
    verified_as_on: str
    coverage_note: str


class LegalAnswerResponse(BaseModel):
    excerpts: list[LegalExcerpt]
    message: str | None
    abstained: bool
    policy_decision: str
    reason: str | None
    sources: list[str]
    disclaimer_version: str
    disclaimer_text: str


@app.post("/legal/answer", response_model=LegalAnswerResponse)
def legal_answer(payload: LegalQueryRequest) -> LegalAnswerResponse:
    try:
        result = handle_legal_query(payload.question)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    excerpts = [
        LegalExcerpt(
            chunk_id=e.chunk_id,
            text=e.text,
            source=e.citation["source"],
            act_no=e.citation["act_no"],
            unit=e.citation["unit"],
            official_url=e.citation["official_url"],
            verified_as_on=e.citation["verified_as_on"],
            coverage_note=e.coverage_note,
        )
        for e in result.excerpts
    ]
    return LegalAnswerResponse(
        excerpts=excerpts,
        message=result.message,
        abstained=result.abstained,
        policy_decision=result.policy_decision,
        reason=result.reason,
        sources=result.sources,
        disclaimer_version=DISCLAIMER_VERSION,
        disclaimer_text=DISCLAIMER_TEXT,
    )
