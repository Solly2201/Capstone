FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt requirements-full.txt ./

# Install the CPU-only PyTorch build BEFORE requirements-full.txt.
#
# sentence-transformers pulls torch transitively, and the default PyPI
# wheel bundles the CUDA runtime (~2 GB of nvidia-* packages). This
# service only ever runs inference on CPU -- there is no GPU in the
# compose stack and app/retrieval/embeddings.py never selects a device --
# so those libraries are installed and then never loaded.
#
# Installing torch first from PyTorch's CPU index means the resolver for
# requirements-full.txt sees the requirement already satisfied and does
# not fall back to the CUDA wheel. The pin matches the version the test
# suite is validated against; if that wheel is unavailable for cp311,
# drop the "==" pin rather than switching back to the default index.
#
# This changes packaging only: same model, same embeddings, same index,
# same retrieval behaviour.
RUN pip install --no-cache-dir torch==2.13.0 --index-url https://download.pytorch.org/whl/cpu \
 && pip install --no-cache-dir -r requirements-full.txt

COPY app ./app

# Where the embedding model is cached. docker-compose.yml mounts a named
# volume here so recreating the container does not re-download it.
ENV HF_HOME=/cache/huggingface

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
