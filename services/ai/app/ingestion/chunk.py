"""Split cleaned statutory text into one chunk per Section/Article.

Two drafting styles are handled, both verified against the actual
India Code text for BNS/BNSS/BSA/Constitution (see
services/ai/tests/test_ingestion.py):

- "sanhita": "43. Arrest how made.—(1) In making an arrest..." -- the
  BNS/BNSS/BSA style. Title is inline, separated from the body by an
  em/en-dash or double hyphen.
- "constitution": "14. Equality before law.\n(1)..." or just
  "14. (1) India, that is Bharat..." -- articles are not reliably
  followed by an inline title in this source's extracted layout, so we
  chunk on the article number alone and leave title empty rather than
  guess.

Both chunkers only look at line-start section/article numbers, so a
number mentioned mid-sentence ("under section 43") never triggers a
false boundary.
"""
from __future__ import annotations

import re

from .models import Chunk

_SANHITA_HEADER = re.compile(
    r"(?m)^(\d{1,3}[A-Z]?)\.\s+([A-Z][^\n]*?)\.\s*[—–-]{1,2}\s*"
)
_CONSTITUTION_HEADER = re.compile(
    r"(?m)^(\d{1,3}[A-Z]?)\.\s+(?=[\(A-Z])"
)
# Consolidated "as amended" India Code PDFs print each amendment's
# history as a numbered footnote ("1. Subs. by Act 10 of 2009, s. 2,
# for ...", reusing small numbers that collide with real section
# numbers). A footnote's own text always opens with one of these
# standard amendment-drafting verbs, which a real section title never
# does, so it is a safe, content-based way to reject that false match
# rather than parse it as a bogus duplicate-numbered section.
_FOOTNOTE_TITLE = re.compile(
    r"^(Subs\.|Ins\.|Om\.|Reps\.|Renumbered\b|Added\b|Substituted\b|Inserted\b|Omitted\b)"
)


def chunk_sanhita(source_id: str, text: str, start_marker: str = "BE it enacted") -> list[Chunk]:
    idx = text.find(start_marker)
    body = text[idx:] if idx != -1 else text
    matches = list(_SANHITA_HEADER.finditer(body))
    chunks: list[Chunk] = []
    for i, m in enumerate(matches):
        unit_number = m.group(1)
        title = m.group(2).strip()
        content_start = m.end()
        content_end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        content = body[content_start:content_end].strip()
        if not content or _FOOTNOTE_TITLE.match(title):
            continue
        chunks.append(
            Chunk(
                chunk_id=f"{source_id}:{unit_number}",
                source_id=source_id,
                unit_number=unit_number,
                title=title,
                text=content,
            )
        )
    return chunks


def chunk_constitution(source_id: str, text: str, start_marker: str = "PART I") -> list[Chunk]:
    idx = text.find(start_marker)
    body = text[idx:] if idx != -1 else text
    matches = list(_CONSTITUTION_HEADER.finditer(body))
    chunks: list[Chunk] = []
    for i, m in enumerate(matches):
        unit_number = m.group(1)
        content_start = m.start()  # keep the article number in the body text for context
        content_end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        content = body[content_start:content_end].strip()
        if not content or len(content) < 5:
            continue
        chunks.append(
            Chunk(
                chunk_id=f"{source_id}:{unit_number}",
                source_id=source_id,
                unit_number=unit_number,
                title="",
                text=content,
            )
        )
    return chunks


CHUNKERS = {
    "sanhita": chunk_sanhita,
    "constitution": chunk_constitution,
}
