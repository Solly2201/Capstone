"""Approved-source registry.

Only sources listed here may enter the RAG corpus. This mirrors
docs/LEGAL_SOURCES.md exactly on purpose -- if you add a source here,
add it there too (and vice versa). This is the "official-source
allow-list" the project spec requires before any admin-added document
can be indexed.
"""
from __future__ import annotations

import os

from .models import SourceMeta

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "legal-corpus")


def _raw(source_id: str) -> str:
    return os.path.join(_DATA_DIR, source_id, "raw.txt")


APPROVED_SOURCES: dict[str, SourceMeta] = {
    "constitution": SourceMeta(
        source_id="constitution",
        display_name="Constitution of India",
        act_no="",
        official_url="https://www.indiacode.nic.in/bitstream/123456789/16124/1/the_constitution_of_india.pdf",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("constitution"),
        unit_label="Article",
        chunk_style="constitution",
        coverage_note="Full text as supplied. Article titles (marginal notes) are not reliably "
                       "extracted for every article due to the source PDF's two-column layout; "
                       "article numbers and body text are exact.",
    ),
    "bns": SourceMeta(
        source_id="bns",
        display_name="Bharatiya Nyaya Sanhita, 2023",
        act_no="ACT NO. 45 OF 2023",
        official_url="https://www.indiacode.nic.in/bitstream/123456789/20062/1/a202345.pdf",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="6th October, 2025",
        raw_path=_raw("bns"),
        unit_label="Section",
        chunk_style="sanhita",
        coverage_note="PARTIAL: definitions, general exceptions / right of private defence "
                       "(ss.14-44), and select offences against woman and child (ss.63-79). "
                       "Chapters on punishments, abetment, offences against the body, and "
                       "offences against property (incl. theft/robbery) are not yet ingested.",
    ),
    "bnss": SourceMeta(
        source_id="bnss",
        display_name="Bharatiya Nagarik Suraksha Sanhita, 2023",
        act_no="ACT NO. 46 OF 2023",
        official_url="https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="6th October, 2025",
        raw_path=_raw("bnss"),
        unit_label="Section",
        chunk_style="sanhita",
        coverage_note="PARTIAL: Chapter I definitions (s.2) and Chapter V arrest of persons "
                       "in full (ss.35-62). Chapter XIII investigation/FIR (ss.173-196) and "
                       "Chapter XXXV bail and bonds (ss.478-496) are NOT yet ingested -- do not "
                       "generate FIR/NCR or bail-procedure articles until these are added.",
    ),
    "bsa": SourceMeta(
        source_id="bsa",
        display_name="Bharatiya Sakshya Adhiniyam, 2023",
        act_no="ACT NO. 47 OF 2023",
        official_url="https://www.indiacode.nic.in/bitstream/123456789/20063/1/aa202347.pdf",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="6th October, 2025",
        raw_path=_raw("bsa"),
        unit_label="Section",
        chunk_style="sanhita",
        coverage_note="PARTIAL: Chapter I-II (preliminary, relevancy of facts intro) plus "
                       "estoppel (s.121), witnesses/privilege (ss.124,132), leading questions "
                       "(s.146). Most of Parts II-IV (evidence rules, burden of proof, "
                       "examination of witnesses) are not yet ingested.",
    ),
}


def get_source(source_id: str) -> SourceMeta:
    try:
        return APPROVED_SOURCES[source_id]
    except KeyError as exc:
        raise ValueError(
            f"'{source_id}' is not on the approved-source allow-list "
            f"(see docs/LEGAL_SOURCES.md). Approved: {list(APPROVED_SOURCES)}"
        ) from exc
