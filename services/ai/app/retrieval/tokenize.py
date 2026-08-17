"""The one BM25 tokenizer, shared by index build time and query time.

Splitting on whitespace alone (the original implementation) leaves
punctuation glued to words -- "estoppel." from a title-terminating
period, "arrest," from a comma -- so a clean query token like
"estoppel" silently fails to match a section whose only occurrence of
the word is punctuation-adjacent. Extracting \\w+ runs fixes that
without doing anything smarter (no stemming, no stopwords) -- BM25's
own term-frequency weighting already handles common words reasonably,
and this project has documented elsewhere (see
app/generation/pipeline.py's DEFAULT_MIN_SCORE docstring) that
over-engineering this layer without evaluation evidence is exactly
what to avoid.
"""
from __future__ import annotations

import re

_WORD = re.compile(r"\w+")


def tokenize(text: str) -> list[str]:
    return _WORD.findall(text.lower())
