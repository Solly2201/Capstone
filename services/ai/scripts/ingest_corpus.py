#!/usr/bin/env python3
"""Re-ingest and re-index the legal corpus.

This is the whole "upload folder" workflow:

  1. Drop a raw/cleaned text extract into
     services/ai/data/legal-corpus/<source_id>/raw.txt
     (source_id must be one already registered in
     app/ingestion/sources.py -- adding a new source_id there is a
     one-time step; after that, updating raw.txt and re-running this
     script is all that's needed).
  2. Run:  python scripts/ingest_corpus.py
  3. The corpus browser (/corpus/*) and later the RAG chat both read
     from the freshly built index -- nothing else to wire up.

Usage:
  python scripts/ingest_corpus.py                 # ingest + index everything
  python scripts/ingest_corpus.py --source bnss    # just one source
  python scripts/ingest_corpus.py --no-index       # ingest only, skip index build
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ingestion.index_build import build_index  # noqa: E402
from app.ingestion.pipeline import ingest_all, ingest_source  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", help="Ingest only this source_id")
    parser.add_argument("--no-index", action="store_true", help="Skip index build")
    args = parser.parse_args()

    if args.source:
        manifest = ingest_source(args.source)
        print(f"{manifest['source_id']}: {manifest['chunk_count']} chunks "
              f"(checksum {manifest['checksum']})")
        if manifest["coverage_note"]:
            print(f"  coverage note: {manifest['coverage_note']}")
    else:
        for manifest in ingest_all():
            print(f"{manifest['source_id']}: {manifest['chunk_count']} chunks "
                  f"(checksum {manifest['checksum']})")
            if manifest["coverage_note"]:
                print(f"  coverage note: {manifest['coverage_note']}")

    if not args.no_index:
        index_manifest = build_index()
        print(f"\nindex: {index_manifest['chunk_count']} chunks, mode={index_manifest['mode']}")
        if index_manifest["mode"] == "lexical-only":
            print("  (install services/ai/requirements-full.txt for hybrid dense+BM25 search)")


if __name__ == "__main__":
    main()
