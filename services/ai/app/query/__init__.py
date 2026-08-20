"""Query understanding.

Deliberately a separate package from `app.retrieval`: nothing here is part
of the frozen retrieval system. This layer only rewrites the text handed
to retrieval; it never touches BM25, the dense index, RRF, the thresholds
or the confidence gate.
"""
