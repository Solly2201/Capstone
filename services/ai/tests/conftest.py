"""Session-wide test configuration.

Two test modules (test_retrieval.py, test_hybrid_retrieval.py)
deliberately exercise the REAL ingestion + index-build + search path,
which rebuilds data/index in place. Before M13 that rebuild always used
DEFAULT_MODEL_NAME whenever DENSE_EMBEDDING_MODEL was unset in the test
environment -- so running the test suite on a machine whose production
index was built from a promoted fine-tuned model (data/models/m12_run2)
silently reverted the index to the base model, an actual incident during
the M13 deployment (see docs/RETRIEVAL_EVALUATION.md's M13 section).

Fix: before any test runs, pin DENSE_EMBEDDING_MODEL to whatever model
the existing on-disk index manifest records, so the tests' rebuild
reproduces the deployed configuration instead of downgrading it.
setdefault keeps an explicitly-set environment override winning. A
recorded local artifact ("data/models/...", the repo's artifact
convention) that doesn't exist on this machine -- e.g. a manifest copied
without the model -- falls through to the default rather than making
every dense test fail on a missing directory.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.retrieval.embeddings import resolve_model_path  # noqa: E402

_MANIFEST = os.path.join(
    os.path.dirname(__file__), "..", "data", "index", "index_manifest.json"
)


def _pin_deployed_embedding_model() -> None:
    try:
        with open(_MANIFEST, encoding="utf-8") as f:
            recorded = json.load(f).get("dense_embedding_model")
    except (OSError, ValueError):
        return
    if not recorded:
        return
    if recorded.startswith("data/") and not os.path.isdir(resolve_model_path(recorded)):
        return
    os.environ.setdefault("DENSE_EMBEDDING_MODEL", recorded)


_pin_deployed_embedding_model()
