"""Deterministic PDF text extraction for the "drop a document, ingest it" workflow.

Scope is intentionally narrow: pull the text layer out of a PDF, page
by page, in order, with no OCR, no layout inference, and no rewriting.
This only exists so an approved official PDF can be dropped straight
into data/legal-corpus/<source_id>/raw.pdf instead of requiring a
human to hand-copy text out of it first. clean.py (layout-artifact
removal) and chunk.py (section/article splitting) still do all the
actual normalization -- this module's only job is "PDF bytes in,
plain text out," so the same PDF always extracts to the same text
(no network calls, no randomness, no model in the loop).
"""
from __future__ import annotations

from pypdf import PdfReader


def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from every page of pdf_path, in page order.

    Pages are joined with a blank line so clean.py's page-number and
    blank-line handling behaves the same as it does for hand-extracted
    raw.txt input. Raises if the PDF has no extractable text layer
    (e.g. a pure image scan) rather than silently returning an empty
    corpus entry -- a scanned-only source needs OCR, which is out of
    scope here, not a silent empty ingest.
    """
    reader = PdfReader(pdf_path)
    pages = [page.extract_text() or "" for page in reader.pages]
    text = "\n\n".join(pages).strip()
    if not text:
        raise ValueError(
            f"No extractable text layer in {pdf_path} -- it may be a scanned "
            f"image PDF, which this deterministic extractor does not OCR. "
            f"Supply an already-extracted raw.txt instead."
        )
    return text
