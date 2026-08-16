from fastapi import FastAPI
from pydantic import BaseModel

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
        enabled_capabilities=["service-boundary"],
    )
