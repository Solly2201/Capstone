"""Typed structures shared across the ingestion pipeline.

Every chunk produced by this pipeline carries enough metadata to satisfy
CAP's citation rule: exact source, exact section/article, official URL,
and a verification ("as on") date. Nothing here ever paraphrases the
underlying legal text -- ingestion only cleans and cuts, never rewrites.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date


@dataclass
class SourceMeta:
    """One approved legal source, mirroring docs/LEGAL_SOURCES.md."""

    source_id: str            # short slug, e.g. "bnss"
    display_name: str         # "Bharatiya Nagarik Suraksha Sanhita, 2023"
    act_no: str                # "ACT NO. 46 OF 2023"
    official_url: str         # India Code bitstream/handle URL
    publisher: str             # "India Code / Ministry of Law and Justice"
    as_on_date: str            # verification date printed on the source PDF
    raw_path: str               # path to the raw text file under data/legal-corpus/<id>/
    unit_label: str = "Section"  # "Section" for the Sanhitas/Adhiniyam, "Article" for the Constitution
    chunk_style: str = "sanhita"  # "sanhita" | "constitution"
    coverage_note: str = ""    # honest note on what part of the source is ingested, if partial
    import_date: str = field(default_factory=lambda: date.today().isoformat())


@dataclass
class Chunk:
    """One retrievable unit of legal text -- one Section or Article."""

    chunk_id: str          # "{source_id}:{unit_number}"
    source_id: str
    unit_number: str        # "43" or "43(5)" for a specific subsection
    title: str               # section/article title if the source provides one, else ""
    text: str                 # the verbatim statutory text, cleaned of layout artifacts only
    part_or_chapter: str = ""  # e.g. "Chapter V — Arrest of Persons"

    def citation(self, source: SourceMeta) -> dict:
        return {
            "source": source.display_name,
            "act_no": source.act_no,
            "unit": f"{source.unit_label} {self.unit_number}",
            "official_url": source.official_url,
            "verified_as_on": source.as_on_date,
        }
