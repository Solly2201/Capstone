# Initial legal-source inventory

CAP accepts legal RAG evidence only from an Admin-approved official-source allow-list. Every imported document must retain its official URL, publisher, document version or “as on” date, import date, checksum, and extraction status.

## Initial approved sources

| Source | Official record | Initial use |
| --- | --- | --- |
| Constitution of India | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/16124/1/the_constitution_of_india.pdf) | Fundamental rights and constitutional context |
| Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023) | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/20062/1/a202345.pdf) | Offences and classifications |
| Bharatiya Nagarik Suraksha Sanhita, 2023 (Act No. 46 of 2023) | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf) | Criminal procedure, arrest, FIR/NCR, bail and warrants |
| Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023) | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/20063/1/aa202347.pdf) | Basic evidence-law awareness |
| Information Technology Act, 2000 (Act No. 21 of 2000) | [India Code](https://www.indiacode.nic.in/handle/123456789/1999) | Cyber offences, digital signatures, electronic governance |
| Protection of Women from Domestic Violence Act, 2005 (Act No. 43 of 2005) | [India Code](https://www.indiacode.nic.in/handle/123456789/2021) | Domestic violence definitions and protection orders |
| Legal Services Authorities Act, 1987 (Act No. 39 of 1987) | [India Code](https://www.indiacode.nic.in/handle/123456789/1925) | Free legal aid entitlement, Lok Adalats |
| Consumer Protection Act, 2019 (Act No. 35 of 2019) | [India Code](https://www.indiacode.nic.in/handle/123456789/18964) | Consumer complaints, District/State/National Commissions |
| Juvenile Justice (Care and Protection of Children) Act, 2015 (Act No. 2 of 2016) | [India Code](https://www.indiacode.nic.in/handle/123456789/2148) | Children in conflict with law, children in need of care and protection |
| India Code | [Official catalogue](https://www.indiacode.nic.in/) | Later approved Acts and official amendments |
| Supreme Court of India | [Official site](https://www.sci.gov.in/) | Official judgments when explicitly approved and versioned |

The initial corpus is deliberately limited. CAP must not claim to cover all Indian law until each source is approved, indexed, evaluated, and versioned.

> **Correction (Increment 2):** the BNSS PDF originally supplied for ingestion was *"AS INTRODUCED IN LOK SABHA"* (Bill No. 122 of 2023) — a superseded draft, not the enacted Sanhita. Section numbering and text differ from the enacted Act No. 46 of 2023. It has been replaced with the official India Code text above. The BNS and Constitution PDFs supplied were verified as the actual enacted/official text and did not need replacing.

## Ingestion status

Run `python services/ai/scripts/ingest_corpus.py` to regenerate this from source. As of Increment 2:

| Source | Chunks ingested | Coverage |
| --- | --- | --- |
| Constitution | 346 articles | Full text supplied. Marginal-note article titles are not reliably extracted (two-column PDF layout); article numbers and body text are exact. |
| Bharatiya Nagarik Suraksha Sanhita | 533 sections | **Full**, including Ch. XIII investigation/FIR (ss.173–196) and Ch. XXXV bail and bonds (ss.478–496). Section titles best-effort recovered for ~51% of sections (two-column layout, see below); section numbers and body text are exact regardless. One section (337) is mislabeled as a duplicate 338 — see below. |
| Bharatiya Nyaya Sanhita | 357 sections | **Full.** Same title/layout note as BNSS (~57% titled). |
| Bharatiya Sakshya Adhiniyam | 170 sections | **Full.** Same title/layout note as BNSS (~52% titled). |
| Information Technology Act, 2000 | 92 sections | Full text as supplied. |
| Protection of Women from Domestic Violence Act, 2005 | 37 sections | Full text as supplied. |
| Legal Services Authorities Act, 1987 | 30 sections | Full text as supplied. |
| Consumer Protection Act, 2019 | 107 sections | **Full.** Same title/layout note as BNSS (~49% titled). |
| Juvenile Justice (Care and Protection of Children) Act, 2015 | 111 sections | **Full.** Same title/layout note as BNSS (~40% titled). |
| Right to Information Act, 2005 | 0 sections | **Not ingested** — see below. |

Coverage gaps are also surfaced live via each source's `coverage_note` field on `/corpus/sources` and on every search/section result, so the UI never implies more coverage than actually exists.

### Two-column gazette PDFs

The official India Code PDFs for BNS, BNSS, BSA, the Consumer Protection
Act 2019, and the Juvenile Justice Act 2015 share a two-column
typesetting layout: a narrow marginal-note column (the section's
official title) beside the body column, plus a printer's line-count
ruler in the body column's right margin, mirrored left/right by page
the way a bound gazette's running heads typically are. `pypdf`'s
reading-order text extraction interleaves the note column into the
body text out of order, and BNS/BSA specifically also route their page
content through a PDF Form XObject that breaks `pypdf`'s
position-aware "layout" mode extraction entirely (returns empty text);
BNS/BSA additionally have no real space character in their embedded
font (word spacing is a small positioning gap, not a space glyph),
which separately breaks naive word segmentation.

`app/ingestion/extract.py`'s `extract_gazette_body_text()` resolves
all of this using `pdfplumber`'s real per-character page coordinates
(not `pypdf`, which can't see this layout's Form-XObject-wrapped
content at all): it locates the note-column/body-column gap and the
body-column/ruler gap independently per page (both can shift slightly
page to page), keeps only body-column words with a tightened
`x_tolerance` (fixes the missing-space-glyph issue), reassembles rows
by real vertical position rather than a fixed grid (avoids scrambling
word order), and drops repeating page-header/footer boilerplate by
content. The result feeds the existing `chunk_constitution`
numeric-boundary chunker (start marker `"BE it enacted"`).

This recovers the exact official section count for all five sources
(BNS 357, BNSS 533, BSA 170, CPA2019 107, JJ Act 2015 111) with real
cross-references intact. A 60-section random-sample audit across
BNS/BSA/BNSS found 1 residual artifact (a stray ruler digit inside one
BNSS section); a further 30-section audit of CPA2019/JJ Act found
none. **Known limitations, both narrow and explicitly accepted:**

- **Section titles are best-effort recovered, not guaranteed.**
  `extract_gazette_titles()` is a second, entirely independent pass
  (it never touches `lines_out`/body text, so a bad title association
  can at worst produce a wrong or missing title, never corrupt a
  chunk's verbatim body) that re-detects the same column gaps, row-
  clusters the *note* column the same way it row-clusters the body
  column, and attributes each note to whichever section boundary was
  most recently seen. This recovers real titles ("Estoppel", "Arrest
  how made", "In what cases bail to be taken") for 40-57% of sections
  across the five sources (exact percentage per source in its
  `coverage_note`); the rest are left empty rather than guessed, since
  a short note can end many lines before its section's body does, or
  start partway through it, and position alone can't always resolve
  that. Query terms that appear only in a section's *un-recovered*
  title, not its body prose, still won't match.
- **BNSS section 337 is mislabeled as a duplicate "338".** A rare
  digit-extraction fault on that one page drops the real "337."
  section-number token; its body text is otherwise intact and
  correctly ordered; the genuine section 338 is also present and
  correct. Affects 1 of 1,207 sections across the five two-column
  sources.
- Both are recorded in each affected source's `coverage_note` and
  surfaced live via `/corpus/sources`, not just in this doc.

The **Right to Information Act, 2005** PDF has a different, unrelated
problem: its embedded font maps the digit "1" to "/" for the large
majority of "(1)" subsection markers (56 of 62 occurrences checked in
the originally-supplied PDF) — a font-encoding defect in that specific
file, not a layout issue. A replacement PDF was placed in the corpus
folder, but byte-for-byte and extracted-text comparison against the
original found it identical (same SHA-256, same corruption pattern) —
the swap did not actually take effect. RTI remains uningested; it
needs a PDF that is genuinely different from the one already tried
(or a hand-extracted `raw.txt`), not a code change.

## Safety redirect sources

| Situation | Official route |
| --- | --- |
| Immediate threat, active crime, fire, medical or other emergency | [Emergency Response Support System — 112](https://112.gov.in/) |
| Cybercrime | [National Cyber Crime Reporting Portal](https://www.cybercrime.gov.in/) |
| Financial cyber fraud | [Ministry of Home Affairs information on 1930](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1814120) |
| Women’s support | [Women Helpline — 181](https://www.spniwcd.wcd.gov.in/help/faqs) |

Contact routes are configuration data, not model-generated text. They must be re-verified before each public deployment.
