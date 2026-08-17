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
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("bns"),
        unit_label="Section",
        chunk_style="sanhita",
        chunk_start_marker="BE it enacted",
        coverage_note="Full text as supplied from a single-column 'bare Act' India Code PDF "
                       "(replaced this session; the source is cleanly extractable, no two-column "
                       "layout). Section titles are inline in the source text and recovered for "
                       "356 of 358 sections (99.4%). Two sections (217, 255) are a known residual "
                       "gap: the source PDF omits the line break between the previous section's "
                       "final sentence and this section's opening number on that specific page, "
                       "so their body text is currently appended to the preceding section's chunk "
                       "rather than split out on its own -- a rare, isolated page-layout artifact, "
                       "not a systematic problem (see docs/LEGAL_SOURCES.md).",
    ),
    "bnss": SourceMeta(
        source_id="bnss",
        display_name="Bharatiya Nagarik Suraksha Sanhita, 2023",
        act_no="ACT NO. 46 OF 2023",
        official_url="https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("bnss"),
        unit_label="Section",
        chunk_style="sanhita",
        chunk_start_marker="BE it enacted",
        coverage_note="Full text as supplied from a single-column 'bare Act' India Code PDF "
                       "(replaced this session), including Chapter XIII investigation/FIR "
                       "(ss.173-196) and Chapter XXXV bail and bonds (ss.478-496). Section "
                       "titles are inline in the source text and recovered for all 531 sections "
                       "(100%) -- the old two-column source's ~51% title coverage and known "
                       "337/338 duplicate-numbering fault are both resolved by this replacement "
                       "(see docs/LEGAL_SOURCES.md).",
    ),
    "bsa": SourceMeta(
        source_id="bsa",
        display_name="Bharatiya Sakshya Adhiniyam, 2023",
        act_no="ACT NO. 47 OF 2023",
        official_url="https://www.indiacode.nic.in/bitstream/123456789/20063/1/aa202347.pdf",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("bsa"),
        unit_label="Section",
        chunk_style="sanhita",
        chunk_start_marker="BE it enacted",
        coverage_note="Full text as supplied from a single-column 'bare Act' India Code PDF "
                       "(replaced this session). Section titles are inline in the source text "
                       "and recovered for all 170 sections (100%) -- the old two-column source's "
                       "~52% title coverage is resolved by this replacement (see "
                       "docs/LEGAL_SOURCES.md).",
    ),
    "it_act": SourceMeta(
        source_id="it_act",
        display_name="Information Technology Act, 2000",
        act_no="ACT NO. 21 OF 2000",
        official_url="https://www.indiacode.nic.in/handle/123456789/1999",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("it_act"),
        unit_label="Section",
        chunk_style="sanhita",
        coverage_note="Full text as supplied (single-column official layout; cleanly "
                       "extractable). Covers digital signatures/electronic signatures, "
                       "electronic governance, certifying authorities, cyber offences "
                       "(hacking, identity theft, cyber terrorism) and penalties.",
    ),
    "pwdva": SourceMeta(
        source_id="pwdva",
        display_name="Protection of Women from Domestic Violence Act, 2005",
        act_no="ACT NO. 43 OF 2005",
        official_url="https://www.indiacode.nic.in/handle/123456789/2021",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("pwdva"),
        unit_label="Section",
        chunk_style="sanhita",
        coverage_note="Full text as supplied (single-column official layout; cleanly "
                       "extractable). Covers the definition of domestic violence, "
                       "Protection Officer/service provider duties, and protection, "
                       "residence, monetary relief and custody orders.",
    ),
    "lsa": SourceMeta(
        source_id="lsa",
        display_name="Legal Services Authorities Act, 1987",
        act_no="ACT NO. 39 OF 1987",
        official_url="https://www.indiacode.nic.in/handle/123456789/1925",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("lsa"),
        unit_label="Section",
        chunk_style="sanhita",
        coverage_note="Full text as supplied (single-column official layout; cleanly "
                       "extractable). Covers NALSA/State/District Legal Services "
                       "Authorities, free legal aid entitlement and Lok Adalats.",
    ),
    "cpa2019": SourceMeta(
        source_id="cpa2019",
        display_name="Consumer Protection Act, 2019",
        act_no="ACT NO. 35 OF 2019",
        official_url="https://www.indiacode.nic.in/handle/123456789/18964",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("cpa2019"),
        unit_label="Section",
        chunk_style="sanhita",
        chunk_start_marker="BE it enacted",
        coverage_note="Full text as supplied from a single-column 'bare Act' India Code PDF "
                       "(replaced this session). Section titles are inline in the source text "
                       "and recovered for all 107 sections (100%) -- the old two-column source's "
                       "~49% title coverage is resolved by this replacement (see "
                       "docs/LEGAL_SOURCES.md). Covers Central/State consumer protection "
                       "authorities and councils, consumer complaints and District/State/"
                       "National Commissions, mediation, and product liability.",
    ),
    "jj2015": SourceMeta(
        source_id="jj2015",
        display_name="Juvenile Justice (Care and Protection of Children) Act, 2015",
        act_no="ACT NO. 2 OF 2016",
        official_url="https://www.indiacode.nic.in/handle/123456789/2148",
        publisher="India Code / Ministry of Law and Justice",
        as_on_date="user-supplied PDF, official India Code text",
        raw_path=_raw("jj2015"),
        unit_label="Section",
        chunk_style="sanhita",
        chunk_start_marker="BE it enacted",
        coverage_note="Full text as supplied from a single-column 'bare Act' India Code PDF "
                       "(replaced this session). Section titles are inline in the source text "
                       "and recovered for 110 of 112 sections (98.2%) -- the old two-column "
                       "source's ~40% title coverage is resolved by this replacement. Two "
                       "sections (61, 86) are a known residual gap: the source PDF marks their "
                       "opening number with an amendment-substitution footnote bracket "
                       "(e.g. \"1[86 Classification...\") that the chunker doesn't yet parse as "
                       "a section boundary, so their body text is currently appended to the "
                       "preceding section's chunk rather than split out on its own (see "
                       "docs/LEGAL_SOURCES.md). Covers children in conflict with law (Juvenile "
                       "Justice Boards), children in need of care and protection (Child Welfare "
                       "Committees), and offences against children.",
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
