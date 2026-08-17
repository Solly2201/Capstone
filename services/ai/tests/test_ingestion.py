"""Ingestion correctness tests, anchored to real, known statutory text.

These are not synthetic fixtures -- they check against sections whose
correct content is independently verifiable (e.g. Article 21 of the
Constitution, "right to life", is one of the most cited provisions in
Indian law). If a chunking regression silently corrupts a section's
text or number, these catch it.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.ingestion.pipeline import ingest_all, load_chunks  # noqa: E402
from app.ingestion.sources import APPROVED_SOURCES  # noqa: E402


def test_ingest_all_sources_produce_chunks():
    manifests = ingest_all()
    assert len(manifests) == len(APPROVED_SOURCES)
    for m in manifests:
        assert m["chunk_count"] > 0


def test_bnss_section_43_matches_known_text():
    """This is the exact fact CAP's homepage cites: women cannot be
    arrested after sunset/before sunrise except in exceptional
    circumstances, per BNSS s.43(5)."""
    chunks = {c.unit_number: c for c in load_chunks("bnss")}
    assert "43" in chunks
    assert "no woman shall be arrested after sunset and before sunrise" in chunks["43"].text.lower()


def test_bnss_definitions_present():
    chunks = {c.unit_number: c for c in load_chunks("bnss")}
    assert "2" in chunks
    text = chunks["2"].text.lower()
    assert "cognizable offence" in text
    assert "bailable offence" in text
    assert "non-bailable offence" in text


def test_constitution_article_21_matches_known_text():
    chunks = {c.unit_number: c for c in load_chunks("constitution")}
    assert "21" in chunks
    text = chunks["21"].text
    assert "deprived of his life or personal liberty" in text
    assert "procedure established by law" in text


def test_every_chunk_has_a_citation():
    from app.ingestion.sources import get_source

    for source_id in ("constitution", "bns", "bnss", "bsa"):
        for chunk in load_chunks(source_id):
            citation = chunk.citation(get_source(source_id))
            assert citation["source"]
            assert citation["unit"]
            assert citation["official_url"].startswith("https://")
