from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

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
        enabled_capabilities=["service-boundary", "corpus-ingestion", "corpus-retrieval"],
    )


# --- Module 1A: legal corpus browser -----------------------------------
# Retrieval only. No LLM generation happens on this router -- that is
# Module 1B (the RAG chat), which is intentionally not built yet.

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
