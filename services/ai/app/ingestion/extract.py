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

import re

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


_NOTE_MAX_X = 112  # pt; the marginal-note column never extends past this
_BODY_MAX_X = 478  # pt; the body column never extends past this
_ROW_TOLERANCE = 3  # pt; words within this many points of "top" share a row
# Repeating page header/footer boilerplate (masthead, ministry line,
# registration number, "Sec. N ]" running head) that sits within the
# body column's own x-range on some pages, so position alone can't
# filter it out -- checked against each row's joined text instead.
_HEADER_LINE_MARKERS = ("GAZETTE OF INDIA", "MINISTRY OF LAW", "REGISTERED NO", "MGIPMRND")
_RULE_LINE = re.compile(r"^[_\-=]{5,}$")
_SEC_RUNNING_HEAD = re.compile(r"SEC\.\s*\d+\s*\]|\bPart\s*II\b", re.IGNORECASE)


def _is_boilerplate(line: str) -> bool:
    return (
        any(marker in line for marker in _HEADER_LINE_MARKERS)
        or _RULE_LINE.match(line.replace(" ", ""))
        or _SEC_RUNNING_HEAD.search(line)
    )


def _find_right_boundary(chars, default: float) -> float:
    """Find the x-gap between the body column's right edge and whatever
    sits beyond it on this page: a printer's line-count ruler ("5",
    "10", "15", ...), and/or -- in this bound gazette's mirrored
    left/right-hand-page layout -- a marginal note printed in the
    *right* margin instead of the left one on some pages. Neither can
    be told apart from body text by content alone (a ruler mark looks
    like a real cross-reference number; a right-margin note is normal
    prose), so this locates the gap the same way _column_gap_midpoint
    does for the left side: the widest gap between consecutive
    x-positions, scanning only x0 > 300 so the (usually wider) note/
    body gap on the left doesn't win by default.
    """
    xs: set[float] = set()
    for c in chars:
        if c["x0"] > 300:
            xs.add(round(c["x0"] * 2) / 2)
    ordered = sorted(xs)
    if len(ordered) < 10:
        return default
    best_gap = 0.0
    best_mid = default
    for a, b in zip(ordered, ordered[1:]):
        gap = b - a
        if gap > best_gap:
            best_gap = gap
            best_mid = (a + b) / 2
    return best_mid if best_gap >= 5 else default


def _column_gap_midpoint(chars, default: float) -> float:
    """Find the x-gap between the note column and the body column.

    Returns the midpoint of the widest gap between consecutive
    character x-positions below x=250 -- the empty strip of page
    between the narrow note column and the wider body column. Falls
    back to `default` if no clear gap is found (e.g. too few chars).
    """
    xs: set[float] = set()
    for c in chars:
        if c["x0"] < 250:
            xs.add(round(c["x0"] * 2) / 2)  # 0.5pt resolution
    ordered = sorted(xs)
    if len(ordered) < 10:
        return default
    best_gap = 0.0
    best_mid = default
    for a, b in zip(ordered, ordered[1:]):
        gap = b - a
        if gap > best_gap:
            best_gap = gap
            best_mid = (a + b) / 2
    return best_mid if best_gap >= 5 else default


def _find_column_boundaries(
    pdf, sample_pages: int = 20, default_left: float = _NOTE_MAX_X, default_right: float = _BODY_MAX_X
) -> tuple[float, float]:
    """Find the document-wide left/right x-gaps bounding the body column.

    Used as a fallback for individual pages whose own gaps can't be
    measured reliably (too little text on that page). Sampled evenly
    across the whole document, not just the first few pages, since a
    gazette PDF's front matter (title page, arrangement-of-clauses
    table of contents) isn't laid out in the same two columns as its
    body and would otherwise skew the measurement.
    """
    step = max(1, len(pdf.pages) // sample_pages)
    chars = [c for page in pdf.pages[::step] for c in page.chars]
    return _column_gap_midpoint(chars, default_left), _find_right_boundary(chars, default_right)


def extract_gazette_body_text(pdf_path: str, note_max_x: float | None = None) -> str:
    """Extract only the body column from a two-column India Code gazette PDF.

    BNS/BNSS/BSA and some other Acts (e.g. the Consumer Protection Act,
    2019 and the Juvenile Justice Act, 2015) are typeset as a bound
    gazette: a narrow marginal-note column (the section's official
    title) beside the body column -- printed on the *left* margin on
    some pages and the *right* margin on others, mirrored the way a
    bound book's running heads typically are -- plus a printer's
    line-count ruler ("5", "10", "15", ...) sharing that right margin
    on ruler-only pages. pypdf's reading-order extraction interleaves
    all of that into the body text out of order; this function instead
    uses each character's real page position (via pdfplumber, which --
    unlike pypdf -- correctly resolves this layout's Form-XObject-
    wrapped page content) to keep only words between the left and
    right column gaps (see _column_gap_midpoint / _find_right_boundary)
    on each page, recomputed per page since the gap width isn't
    perfectly constant across a 200+ page Act. Neither the note nor
    the ruler can be dropped by content alone -- genuine statutory
    prose also contains bare numbers (cross-references like "sections
    474 and 475"), so this is position-based throughout, never a
    content-pattern guess.

    The marginal note itself is discarded, not reconstructed, because
    it is not reliably alignable to "its" section from position alone
    (a short note can end many lines before its section's body does,
    or not start until partway through it) -- the same
    already-accepted, documented tradeoff as the Constitution's
    two-column layout (see docs/LEGAL_SOURCES.md): body text and
    citations stay exact, only the title is left for the section
    number and body prose to speak for.
    """
    import pdfplumber

    lines_out: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        if note_max_x is not None:
            doc_left, doc_right = note_max_x, _BODY_MAX_X
        else:
            doc_left, doc_right = _find_column_boundaries(pdf)
        for page in pdf.pages:
            # Neither gap is perfectly constant across a 200+ page Act --
            # a page with an unusually long note (on whichever margin
            # it's printed that page), or one with the ruler active,
            # can shift the gap enough to leak a stray word into that
            # page's body. Recomputing per page (with the document-wide
            # values as a fallback for pages with too little text to
            # measure their own gaps) tracks that.
            if note_max_x is not None:
                left_x, right_x = doc_left, doc_right
            else:
                left_x = _column_gap_midpoint(page.chars, doc_left)
                right_x = _find_right_boundary(page.chars, doc_right)
            # x_tolerance=1 (pdfplumber's default is 3): BNS/BSA's
            # embedded font has no real space glyph -- word spacing is
            # done with a small positioning gap rather than a space
            # character -- so the default tolerance merges adjacent
            # words. A tighter tolerance splits those correctly and is
            # a no-op for sources with normal word spacing (verified
            # identical output on BNSS at both settings).
            words = [w for w in page.extract_words(x_tolerance=1) if left_x <= w["x0"] < right_x]
            words.sort(key=lambda w: w["top"])
            row: list[dict] = []
            prev_top = None

            def _flush(row):
                row.sort(key=lambda r: r["x0"])
                line = " ".join(r["text"] for r in row)
                if not _is_boilerplate(line):
                    lines_out.append(line)

            for w in words:
                if row and prev_top is not None and w["top"] - prev_top > _ROW_TOLERANCE:
                    _flush(row)
                    row = []
                row.append(w)
                prev_top = w["top"]
            if row:
                _flush(row)
            # No blank-line page-break marker here (unlike extract_pdf_text):
            # a page boundary mid-sentence is exactly the ordinary
            # single-line-wrap case clean.py's _SOFT_LINEBREAK already
            # joins with a space; inserting a blank line here would
            # instead read as an intentional paragraph break and leave
            # a stray double-newline inside a chunk's body text.

    text = "\n".join(lines_out).strip()
    # Trailing Schedules are tables (classification lists, forms), not
    # prose sections -- their own row/serial numbers would otherwise
    # be mis-chunked as bogus duplicate "sections" by the numeric
    # section-boundary chunker this text feeds into.
    schedule = re.search(r"(?m)^THE (FIRST )?SCHEDULE\s*$", text)
    if schedule:
        text = text[: schedule.start()].strip()
    if not text:
        raise ValueError(
            f"No extractable body-column text in {pdf_path} -- check that "
            f"note_max_x={note_max_x} matches this document's column layout."
        )
    return text


_TITLE_SECTION_BOUNDARY = re.compile(r"^(\d{1,3}[A-Z]?)\.\s+(?=[\(A-Z“\"])")


def extract_gazette_titles(pdf_path: str, start_marker: str = "BE it enacted") -> dict[str, str]:
    """Best-effort section-title recovery for a two-column gazette PDF.

    extract_gazette_body_text() deliberately discards the marginal note
    (title) column because it isn't reliably alignable to "its" section
    from position alone in the general case. This is a separate,
    independent pass that attempts that alignment anyway -- entirely
    decoupled from body extraction (it never touches lines_out / the
    body text), so a bad title association can at worst produce a
    wrong or missing title, never corrupt a chunk's verbatim body text.

    Approach: re-detect the same left/right column gaps, per page, that
    extract_gazette_body_text uses. Row-cluster the *body* column's
    words to find each section-boundary row's vertical position (the
    same "N. (1) ..." pattern chunk_constitution looks for); row-
    cluster the *note* column's words the same way. Merge both row
    sequences in top-to-bottom order and accumulate note-column text
    under whichever section boundary was most recently seen -- correct
    whenever a section's note starts at or after its own boundary row,
    which every sampled section in this corpus does.

    Returns {unit_number: title}; a unit_number with no confidently
    associated note text is simply absent (caller must not fabricate
    one). Titles are cosmetic/retrieval metadata, not the verbatim
    citation text, so a missing or slightly imprecise title carries
    none of the fabrication risk a wrong body excerpt would.
    """
    import pdfplumber

    titles: dict[str, list[str]] = {}
    current_unit: str | None = None
    started = False

    with pdfplumber.open(pdf_path) as pdf:
        doc_left, doc_right = _find_column_boundaries(pdf)
        for page in pdf.pages:
            left_x = _column_gap_midpoint(page.chars, doc_left)
            right_x = _find_right_boundary(page.chars, doc_right)
            words = page.extract_words(x_tolerance=1)
            note_words = [w for w in words if w["x0"] < left_x]
            body_words = [w for w in words if left_x <= w["x0"] < right_x]

            events: list[tuple[float, str, str]] = []  # (top, "body"|"note", text)
            for zone, zone_words in (("body", body_words), ("note", note_words)):
                zone_words = sorted(zone_words, key=lambda w: w["top"])
                row: list[dict] = []
                prev_top = None
                for w in zone_words:
                    if row and prev_top is not None and w["top"] - prev_top > _ROW_TOLERANCE:
                        row.sort(key=lambda r: r["x0"])
                        events.append((row[0]["top"], zone, " ".join(r["text"] for r in row)))
                        row = []
                    row.append(w)
                    prev_top = w["top"]
                if row:
                    row.sort(key=lambda r: r["x0"])
                    events.append((row[0]["top"], zone, " ".join(r["text"] for r in row)))

            events.sort(key=lambda e: e[0])
            for _, zone, line in events:
                if not started:
                    if start_marker in line:
                        started = True
                    continue
                if _is_boilerplate(line):
                    continue
                if zone == "body":
                    m = _TITLE_SECTION_BOUNDARY.match(line)
                    if m:
                        current_unit = m.group(1)
                elif zone == "note" and current_unit is not None:
                    if re.fullmatch(r"\d{1,3}", line):
                        continue
                    titles.setdefault(current_unit, []).append(line)

    # A definitions clause's note sometimes trails a footnoted amending-Act
    # citation ("Definitions. 21 of 2000") rather than just the title;
    # strip that pattern (repeatable -- one title had it twice) rather
    # than let it read as part of the title.
    _TRAILING_ACT_CITATION = re.compile(r"\s*\(?\b\d{1,4}\s+of\s+\d{4}\)?\.?\s*$")
    cleaned: dict[str, str] = {}
    for unit, parts in titles.items():
        title = " ".join(parts).strip()
        while True:
            stripped = _TRAILING_ACT_CITATION.sub("", title)
            if stripped == title:
                break
            title = stripped.strip()
        title = title.rstrip(".").strip()
        # A title that, after cleanup, is only digits/punctuation (e.g.
        # end-of-document printer's colophon misattributed to the last
        # section) isn't a title at all -- omit rather than keep noise.
        if title and re.search(r"[A-Za-z]{3,}", title):
            cleaned[unit] = title
    return cleaned
