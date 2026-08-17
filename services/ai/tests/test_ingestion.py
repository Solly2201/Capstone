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


def test_constitution_fundamental_rights_titles_are_recovered():
    """Part III's marginal-note titles sit in a two-column-reordered
    trailer block in raw.txt (see chunk.py's _KNOWN_ARTICLE_TITLES
    docstring) and can't be recovered by the general inline-title rule
    chunk_sanhita uses -- these are hand-verified against the actual
    extracted text. Regression guard for eval/queries.jsonl's q16-q22,
    q45, q46 (docs/RETRIEVAL_EVALUATION.md), which all depend on this
    title vocabulary to outrank near-miss articles/lexical distractors."""
    chunks = {c.unit_number: c for c in load_chunks("constitution")}
    expected = {
        "14": "Equality before law.",
        "15": "Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth.",
        "16": "Equality of opportunity in matters of public employment.",
        "19": "Protection of certain rights regarding freedom of speech, etc.",
        "20": "Protection in respect of conviction for offences.",
        "21": "Protection of life and personal liberty.",
        "22": "Protection against arrest and detention in certain cases.",
    }
    for unit, title in expected.items():
        assert unit in chunks
        assert chunks[unit].title == title

    # No overreach: articles outside the hand-verified set stay title=""
    # rather than silently inheriting a guessed value.
    assert chunks["1"].title == ""
    assert chunks["25"].title == ""


def test_constitution_titles_do_not_leak_into_other_gazette_sources():
    """chunk_constitution (chunk.py) is reused for every two-column
    gazette source (BNS/BNSS/BSA/CPA2019/JJ Act) since they share the
    same header regex -- the Constitution-specific hand-verified title
    table must be keyed off source_id, not unit_number alone, or e.g.
    jj2015 section 14 would wrongly inherit Article 14's title
    'Equality before law.' instead of its own gazette-recovered title
    (or "" if none was recovered)."""
    for source_id in ("bns", "bnss", "bsa", "cpa2019", "jj2015"):
        chunks = {c.unit_number: c for c in load_chunks(source_id)}
        if "14" in chunks:
            assert chunks["14"].title != "Equality before law."
        if "22" in chunks:
            assert chunks["22"].title != "Protection against arrest and detention in certain cases."


def test_every_chunk_has_a_citation():
    from app.ingestion.sources import get_source

    for source_id in ("constitution", "bns", "bnss", "bsa"):
        for chunk in load_chunks(source_id):
            citation = chunk.citation(get_source(source_id))
            assert citation["source"]
            assert citation["unit"]
            assert citation["official_url"].startswith("https://")
