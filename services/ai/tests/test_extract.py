"""PDF extraction and the raw.pdf -> raw.txt ingestion wiring.

No network, no OCR, no model in the loop -- extract_pdf_text() is a
pure function of the PDF's text layer, so these tests build small
throwaway PDFs on disk rather than depending on a real India Code PDF.
"""
import os
import sys

import pytest
from pypdf import PdfWriter

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.ingestion.extract import extract_pdf_text  # noqa: E402
from app.ingestion.pipeline import _ensure_raw_text  # noqa: E402


def _write_blank_pdf(path: str) -> None:
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    with open(path, "wb") as f:
        writer.write(f)


def test_extract_raises_on_no_text_layer(tmp_path):
    pdf_path = tmp_path / "scanned.pdf"
    _write_blank_pdf(str(pdf_path))
    with pytest.raises(ValueError, match="No extractable text layer"):
        extract_pdf_text(str(pdf_path))


def test_ensure_raw_text_does_nothing_when_raw_txt_already_exists(tmp_path):
    raw_path = tmp_path / "raw.txt"
    raw_path.write_text("existing text", encoding="utf-8")
    (tmp_path / "raw.pdf").write_bytes(b"not a real pdf, should never be read")

    _ensure_raw_text("some_source", str(raw_path))

    assert raw_path.read_text(encoding="utf-8") == "existing text"


def test_ensure_raw_text_does_nothing_when_neither_file_exists(tmp_path, monkeypatch):
    import app.ingestion.pipeline as pipeline_module

    raw_path = tmp_path / "raw.txt"
    monkeypatch.setattr(pipeline_module, "_source_dir", lambda source_id: str(tmp_path))
    # No raw.pdf either -- should be a no-op, leaving the caller to raise
    # its own FileNotFoundError.
    pipeline_module._ensure_raw_text("some_source", str(raw_path))
    assert not raw_path.exists()


def test_ensure_raw_text_extracts_pdf_when_raw_txt_missing(tmp_path, monkeypatch):
    import app.ingestion.pipeline as pipeline_module
    from app.ingestion.models import SourceMeta

    raw_path = tmp_path / "raw.txt"
    (tmp_path / "raw.pdf").write_bytes(b"placeholder")
    fake_source = SourceMeta(
        source_id="some_source",
        display_name="Some Source",
        act_no="",
        official_url="",
        publisher="",
        as_on_date="",
        raw_path=str(raw_path),
    )
    monkeypatch.setattr(pipeline_module, "_source_dir", lambda source_id: str(tmp_path))
    monkeypatch.setattr(pipeline_module, "get_source", lambda source_id: fake_source)
    monkeypatch.setattr(pipeline_module, "extract_pdf_text", lambda path: "extracted statutory text")

    pipeline_module._ensure_raw_text("some_source", str(raw_path))

    assert raw_path.read_text(encoding="utf-8") == "extracted statutory text"
