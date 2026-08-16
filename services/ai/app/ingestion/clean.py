"""Layout-artifact cleanup for text extracted from India Code PDFs.

This never touches the substance of the legal text -- only whitespace,
stray page numbers, and PDF-extraction line breaks. If a cleaning rule
would change a word, it does not belong here.
"""
from __future__ import annotations

import re

_LONE_PAGE_NUMBER = re.compile(r"(?m)^\s*\d{1,4}\s*$\n?")
_MULTI_BLANK = re.compile(r"\n{3,}")
_TRAILING_SPACE = re.compile(r"[ \t]+\n")
_HYPHEN_LINEBREAK = re.compile(r"(\w)-\n(\w)")
# A single newline that is NOT a section/article boundary and not a
# paragraph break -- i.e. a mid-sentence PDF line wrap. Section/article
# headers always start with digits, so we protect those from being
# joined into the previous line.
_SOFT_LINEBREAK = re.compile(r"(?<!\n)\n(?!\n)(?!\d{1,3}[A-Z]?\.\s)")


def clean_extracted_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Rejoin words split across a line break by a hyphen (PDF wrap artifact).
    text = _HYPHEN_LINEBREAK.sub(r"\1\2", text)
    # Drop lines that are only a page number.
    text = _LONE_PAGE_NUMBER.sub("", text)
    text = _TRAILING_SPACE.sub("\n", text)
    # Join ordinary mid-sentence line wraps into a space so substring/
    # phrase matching (and citation-quoting) isn't broken by PDF layout.
    text = _SOFT_LINEBREAK.sub(" ", text)
    text = _MULTI_BLANK.sub("\n\n", text)
    return text.strip()
