"""Local dense-embedding model wrapper for semantic retrieval.

This is retrieval infrastructure only -- it turns text into vectors for
similarity search. It never generates an answer (see the standing
"no generative LLM in the legal-answer pipeline" decision in
docs/PROJECT_STATE.md). Swapping the embedding model is a one-line
change (DENSE_EMBEDDING_MODEL) plus a re-run of ingest_corpus.py --
nothing in the retrieval or generation layers needs to change shape,
since they only ever see chunk_id/score/citation dicts.

The model is loaded once per process (module-level cache) since
SentenceTransformer construction is expensive relative to a single
query encode.
"""
from __future__ import annotations

import os

# Some environments have a TensorFlow install with a Keras version that
# transformers' TF integration can't load (Keras 3 without tf-keras).
# sentence-transformers/transformers only need the PyTorch backend here,
# so disable the TF integration path before either library is imported --
# this must happen before the first `import transformers` anywhere in the
# process. Harmless if TF isn't installed at all.
os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_ADVISORY_WARNINGS", "1")

DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_DIMENSION = 384


def model_name() -> str:
    """The embedding model to use, configurable without code changes.

    Changing DENSE_EMBEDDING_MODEL and re-running ingest_corpus.py is
    the entire migration path to a different embedding model -- the
    dimension is read back from the model itself at build time and
    recorded in index_manifest.json, so nothing downstream hardcodes it.
    """
    return os.environ.get("DENSE_EMBEDDING_MODEL", DEFAULT_MODEL_NAME)


_model_cache: dict[str, object] = {}


def is_available() -> bool:
    try:
        import sentence_transformers  # noqa: F401
    except ImportError:
        return False
    return True


def _get_model(name: str):
    if name not in _model_cache:
        from sentence_transformers import SentenceTransformer

        _model_cache[name] = SentenceTransformer(name)
    return _model_cache[name]


def embed_texts(texts: list[str], name: str | None = None):
    """Encode texts into L2-normalized embedding vectors (float32).

    Normalizing at encode time means cosine similarity reduces to a
    plain dot product everywhere downstream (index build and query
    time alike), so the retrieval layer never has to re-normalize.
    """
    import numpy as np

    model = _get_model(name or model_name())
    vectors = model.encode(list(texts), show_progress_bar=False, convert_to_numpy=True)
    vectors = np.asarray(vectors, dtype="float32")
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


def embed_query(text: str, name: str | None = None):
    return embed_texts([text], name=name)[0]
