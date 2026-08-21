"""resolve_model_path: local fine-tuned artifacts vs Hugging Face ids.

Pure path logic -- no sentence-transformers install required. The
service-root-relative form ("data/models/m12_run2") is what
index_manifest.json records for a deployed local artifact, and it must
resolve identically on the host (any CWD) and inside the Docker image
(CWD=/app, data/ mounted), while HF ids and absolute paths pass through
untouched. See docs/RETRIEVAL_EVALUATION.md's M13 section.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.retrieval import embeddings  # noqa: E402


def test_hf_model_id_passes_through():
    assert (
        embeddings.resolve_model_path("sentence-transformers/all-MiniLM-L6-v2")
        == "sentence-transformers/all-MiniLM-L6-v2"
    )


def test_absolute_path_passes_through(tmp_path):
    p = str(tmp_path)
    assert embeddings.resolve_model_path(p) == p


def test_existing_relative_dir_resolves_against_service_root(tmp_path, monkeypatch):
    (tmp_path / "data" / "models" / "run_x").mkdir(parents=True)
    monkeypatch.setattr(embeddings, "_SERVICE_ROOT", str(tmp_path))
    resolved = embeddings.resolve_model_path("data/models/run_x")
    assert os.path.isabs(resolved)
    assert resolved == os.path.join(str(tmp_path), "data/models/run_x")


def test_missing_relative_path_passes_through(tmp_path, monkeypatch):
    monkeypatch.setattr(embeddings, "_SERVICE_ROOT", str(tmp_path))
    assert embeddings.resolve_model_path("data/models/nope") == "data/models/nope"


def test_deployed_artifact_resolves_when_present():
    """On a machine with the promoted artifact deployed, the manifest's
    recorded value must load from the artifact directory, not be
    mistaken for a Hugging Face id. Skipped on fresh clones."""
    import pytest

    if not os.path.isdir(os.path.join(embeddings._SERVICE_ROOT, "data", "models", "m12_run2")):
        pytest.skip("no local m12_run2 artifact on this machine")
    resolved = embeddings.resolve_model_path("data/models/m12_run2")
    assert os.path.isabs(resolved) and os.path.isdir(resolved)
