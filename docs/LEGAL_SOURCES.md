# Initial legal-source inventory

CAP accepts legal RAG evidence only from an Admin-approved official-source allow-list. Every imported document must retain its official URL, publisher, document version or “as on” date, import date, checksum, and extraction status.

## Initial approved sources

| Source | Official record | Initial use |
| --- | --- | --- |
| Constitution of India | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/16124/1/the_constitution_of_india.pdf) | Fundamental rights and constitutional context |
| Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023) | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/20062/1/a202345.pdf) | Offences and classifications |
| Bharatiya Nagarik Suraksha Sanhita, 2023 (Act No. 46 of 2023) | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf) | Criminal procedure, arrest, FIR/NCR, bail and warrants |
| Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023) | [India Code PDF](https://www.indiacode.nic.in/bitstream/123456789/20063/1/aa202347.pdf) | Basic evidence-law awareness |
| India Code | [Official catalogue](https://www.indiacode.nic.in/) | Later approved Acts and official amendments |
| Supreme Court of India | [Official site](https://www.sci.gov.in/) | Official judgments when explicitly approved and versioned |

The initial corpus is deliberately limited. CAP must not claim to cover all Indian law until each source is approved, indexed, evaluated, and versioned.

> **Correction (Increment 2):** the BNSS PDF originally supplied for ingestion was *"AS INTRODUCED IN LOK SABHA"* (Bill No. 122 of 2023) — a superseded draft, not the enacted Sanhita. Section numbering and text differ from the enacted Act No. 46 of 2023. It has been replaced with the official India Code text above. The BNS and Constitution PDFs supplied were verified as the actual enacted/official text and did not need replacing.

## Ingestion status

Run `python services/ai/scripts/ingest_corpus.py` to regenerate this from source. As of Increment 2:

| Source | Chunks ingested | Coverage |
| --- | --- | --- |
| Constitution | 346 articles | Full text supplied. Marginal-note article titles are not reliably extracted (two-column PDF layout); article numbers and body text are exact. |
| Bharatiya Nagarik Suraksha Sanhita | 27 sections | **Partial.** Ch. I definitions and Ch. V arrest of persons (ss.35–62) in full. Ch. XIII investigation/FIR (ss.173–196) and Ch. XXXV bail and bonds (ss.478–496) not yet ingested — do not build FIR/NCR or bail-procedure content on this source until those chapters are added. |
| Bharatiya Nyaya Sanhita | 15 sections | **Partial.** Definitions, general exceptions/private defence (ss.14–44), and select offences against woman and child (ss.63–79). Punishments, abetment, offences against the body, and offences against property (theft/robbery) not yet ingested. |
| Bharatiya Sakshya Adhiniyam | 7 sections | **Partial.** Preliminary/relevancy-of-facts intro, estoppel, witness competency/privilege, leading questions. Most of evidence procedure not yet ingested. |

Coverage gaps are also surfaced live via each source's `coverage_note` field on `/corpus/sources` and on every search/section result, so the UI never implies more coverage than actually exists.

## Safety redirect sources

| Situation | Official route |
| --- | --- |
| Immediate threat, active crime, fire, medical or other emergency | [Emergency Response Support System — 112](https://112.gov.in/) |
| Cybercrime | [National Cyber Crime Reporting Portal](https://www.cybercrime.gov.in/) |
| Financial cyber fraud | [Ministry of Home Affairs information on 1930](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1814120) |
| Women’s support | [Women Helpline — 181](https://www.spniwcd.wcd.gov.in/help/faqs) |

Contact routes are configuration data, not model-generated text. They must be re-verified before each public deployment.
