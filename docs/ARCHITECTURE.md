# CAP architecture and agent workflow

## Service boundary

```mermaid
flowchart LR
  Web["React web application"] <--> Api["Node / Express API"]
  Api <--> Mongo[(MongoDB)]
  Api <--> Redis[(Redis)]
  Api <--> Files["Local storage adapter"]
  Api <--> Ai["FastAPI AI service"]
  Ai <--> Index["FAISS + BM25\nofficial legal corpus"]
  Ai <--> Files
```

## AI orchestrator workflow

```mermaid
flowchart TD
  Input["Citizen input\ntext, image, or later voice"] --> Sanitize["Input sanitisation\nPII + prompt-injection checks"]
  Sanitize --> Intent["1. Intent agent\nlegal · civic · petition · general"]
  Intent --> Risk["3. Risk / UPL agent\nrules + classifier"]
  Risk -->|"High-risk or advice request"| Redirect["Stop AI\nshow official emergency, police, cybercrime, or legal-aid route"]
  Risk -->|"Legal awareness"| Legal["2. Legal RAG agent\nhybrid retrieval"]
  Legal --> Retrieve["Official-source allow-list\nBM25 + FAISS + reranker"]
  Retrieve --> Confidence{"Evidence + citation\nconfidence sufficient?"}
  Confidence -->|No| Abstain["Abstain\nNo verified information found"]
  Confidence -->|Yes| Explain["7. Explainability agent\nsections · links · verified date"]
  Explain --> Output["Grounded informational response\nplus disclaimer"]
  Intent -->|"Civic report"| Vision["5. Civic vision agent\nquality · faces/plates · category"]
  Vision --> Triage["6. Severity / triage agent\ncitizen selection + AI validation"]
  Triage --> CivicOutput["Masked report + duplicate check\npriority and simulated authority workflow"]
  Intent -->|"Petition"| Petition["8. Petition recommendation agent\nDBSCAN + SLA/cluster rules"]
  Petition --> PetitionOutput["Suggestion only\ncitizen creates or signs petition"]
  Output --> Audit["Audit log + evaluation events"]
  Abstain --> Audit
  Redirect --> Audit
  CivicOutput --> Audit
  PetitionOutput --> Audit
```

## Guardrails

1. The **Risk / UPL agent runs before legal generation**.
2. The legal agent may generate only when official-source retrieval, reranking, and citation validation pass configured thresholds.
3. The system records source identifiers, sections/articles, source URLs, verification dates, confidence, and the policy decision behind every legal response.
4. The civic and petition agents make recommendations, never external government submissions or emergency calls.
5. The language pipeline is English-only in the first release; its service boundary keeps multilingual expansion isolated.

## Increment path

| Increment | Outcome |
| --- | --- |
| 1 | Foundation, public UI, auth/RBAC boundary, CI and operational documentation — **done** |
| 2 | Legal learning paths and official-source ingestion — **in progress**: ingestion pipeline, hybrid retrieval (BM25; dense embeddings optional), document browser, and 3 grounded learning articles are built and tested; BNS/BNSS full-corpus ingestion (FIR, bail, offences-against-property chapters) still outstanding |
| 3 | Grounded legal RAG, UPL/risk guardrails, evaluation harness |
| 4 | Civic reporting, image privacy processing, duplicates, SLA and Authority UI |
| 5 | Petitions, signatures, moderation and recommendation agent |
| 6 | Evaluation, observability and deployment preparation |

## Legal corpus ingestion (Increment 2)

```mermaid
flowchart LR
  Raw["data/legal-corpus/<source>/raw.txt\n(the upload folder)"] --> Clean["clean.py\nlayout-artifact removal only"]
  Clean --> Chunk["chunk.py\nsection/article boundary split"]
  Chunk --> Manifest["source.json + chunks.jsonl\nchecksum, as-on date, coverage note"]
  Manifest --> Index["index_build.py\nBM25 always; dense embeddings if installed"]
  Index --> Search["retrieval/search.py\ncited results, no generation"]
  Search --> API["FastAPI /corpus/*"]
  API --> Proxy["Node /api/corpus/*"]
  Proxy --> UI["Document browser + learning articles"]
```

Re-running `python services/ai/scripts/ingest_corpus.py` after editing or adding a `raw.txt` is the entire re-indexing workflow — no other code changes needed to pick up updated source text. This layer is retrieval-only by design: Module 1B (the conversational legal chat) adds LLM generation, citation validation, and abstention on top of the same index, and is intentionally not built yet.

