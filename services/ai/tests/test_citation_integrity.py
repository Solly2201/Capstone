"""Citation identity.

A citation is the only thing standing between "here is some retrieved
text" and "here is what the law says". If the Act named to the reader,
or the section number shown beside it, can drift from the chunk the text
actually came from, the product is quietly making things up while
looking careful.

A 33-probe audit across every route the pipeline has (direct-section,
citizen-language, RTI, unsupported-domain, hard-negative, emergency,
low-confidence) found zero defects over 100 excerpts. These tests pin
the property down permanently, at the level where it is decided --
`Chunk.citation()` -- so they need no index and run in CI.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.ingestion.models import Chunk  # noqa: E402
from app.ingestion.pipeline import ingest_source, load_chunks  # noqa: E402
from app.ingestion.sources import APPROVED_SOURCES  # noqa: E402

REQUIRED_KEYS = ("source", "act_no", "unit", "official_url", "verified_as_on")


def test_a_citation_names_the_chunks_own_act_and_section():
    for source_id, meta in APPROVED_SOURCES.items():
        chunk = Chunk(
            chunk_id=f"{source_id}:42",
            source_id=source_id,
            unit_number="42",
            title="Some title",
            text="Some text.",
        )
        citation = chunk.citation(meta)
        for key in REQUIRED_KEYS:
            assert key in citation, f"{source_id}: citation missing {key}"
        assert citation["source"] == meta.display_name, source_id
        assert citation["official_url"] == meta.official_url, source_id
        assert citation["unit"] == f"{meta.unit_label} 42", source_id


def test_the_section_shown_tracks_the_unit_number_not_the_position():
    """The displayed section must be derived from the chunk's own unit
    number. A citation that hard-coded or off-by-oned a number would
    still look plausible to a reader, which is exactly why this is
    asserted rather than eyeballed."""
    meta = APPROVED_SOURCES["bnss"]
    for unit in ("1", "43", "173", "173A", "531"):
        chunk = Chunk(
            chunk_id=f"bnss:{unit}",
            source_id="bnss",
            unit_number=unit,
            title="t",
            text="x",
        )
        assert chunk.citation(meta)["unit"] == f"Section {unit}"


def test_the_constitution_is_cited_by_article_not_section():
    meta = APPROVED_SOURCES["constitution"]
    chunk = Chunk(
        chunk_id="constitution:21",
        source_id="constitution",
        unit_number="21",
        title="Protection of life and personal liberty.",
        text="x",
    )
    assert chunk.citation(meta)["unit"] == "Article 21"


def test_every_source_declares_what_a_citation_needs():
    """A registered source with no official URL or no Act number would
    produce a citation a reader cannot verify."""
    for source_id, meta in APPROVED_SOURCES.items():
        assert meta.display_name.strip(), source_id
        assert meta.official_url.startswith("https://"), source_id
        assert meta.unit_label in ("Section", "Article"), source_id
        assert meta.publisher.strip(), source_id
        # The Constitution has no Act number; every statute must.
        if source_id != "constitution":
            assert meta.act_no.strip(), source_id


def test_real_rti_chunks_cite_themselves_consistently():
    """The same property over real ingested chunks rather than
    constructed ones. RTI is used because ingesting it is cheap and
    needs no embedding model."""
    meta = APPROVED_SOURCES["rti"]
    ingest_source("rti")
    chunks = load_chunks("rti")
    assert chunks, "RTI ingestion produced no chunks"
    for chunk in chunks:
        citation = chunk.citation(meta)
        assert citation["source"] == "Right to Information Act, 2005"
        assert citation["unit"] == f"Section {chunk.unit_number}"
        assert chunk.chunk_id == f"rti:{chunk.unit_number}"
        assert chunk.text.strip(), chunk.chunk_id


@pytest.mark.parametrize("excluded", ["13", "16", "25", "27"])
def test_no_excluded_rti_section_can_be_cited(excluded):
    ingest_source("rti")
    units = {chunk.unit_number for chunk in load_chunks("rti")}
    assert excluded not in units
