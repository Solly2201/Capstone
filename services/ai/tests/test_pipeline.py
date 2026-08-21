"""Deterministic legal-answer pipeline tests: confidence gate,
abstention, and multi-source preservation. No provider/mock needed
anywhere in this file -- build_legal_answer() is a pure function of
already-retrieved results, which is itself a direct benefit of the
no-generation architecture (there is no free-text output to fake).
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.pipeline import ABSTENTION_MESSAGE, build_legal_answer  # noqa: E402

BNSS_RESULT = {
    "chunk_id": "bnss:43",
    "score": 15.39,
    "text": "No woman shall be arrested after sunset and before sunrise.",
    "title": "",
    "citation": {
        "source": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "act_no": "ACT NO. 46 OF 2023",
        "unit": "Section 43",
        "official_url": "https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf",
        "verified_as_on": "6th October, 2025",
    },
    "coverage_note": "PARTIAL",
}
CONSTITUTION_RESULT = {
    "chunk_id": "constitution:21",
    "score": 14.75,
    "text": "No person shall be deprived of his life or personal liberty except "
    "according to procedure established by law.",
    "title": "",
    "citation": {
        "source": "Constitution of India",
        "act_no": "",
        "unit": "Article 21",
        "official_url": "https://www.indiacode.nic.in/bitstream/123456789/16124/1/the_constitution_of_india.pdf",
        "verified_as_on": "user-supplied PDF, official India Code text",
    },
    "coverage_note": "Full text as supplied.",
}
WEAK_RESULT = {**BNSS_RESULT, "score": 0.5}


# --- confidence gate / insufficient evidence -------------------------------


def test_empty_results_abstain():
    result = build_legal_answer([])
    assert result.abstained is True
    assert result.reason == "no_matching_content"
    assert result.excerpts == []
    assert result.message == ABSTENTION_MESSAGE


def test_low_score_results_abstain():
    result = build_legal_answer([WEAK_RESULT])
    assert result.abstained is True
    assert result.reason == "insufficient_evidence"
    assert result.excerpts == []


def test_min_score_env_var_overrides_default(monkeypatch):
    monkeypatch.setenv("LEGAL_CHAT_MIN_SCORE", "0.1")
    result = build_legal_answer([WEAK_RESULT])
    assert result.abstained is False


def test_min_score_env_var_can_raise_the_floor(monkeypatch):
    monkeypatch.setenv("LEGAL_CHAT_MIN_SCORE", "100")
    result = build_legal_answer([BNSS_RESULT])
    assert result.abstained is True


# --- deterministic excerpt content -------------------------------------


def test_answer_contains_verbatim_retrieved_text_and_real_citation():
    result = build_legal_answer([BNSS_RESULT])
    assert result.abstained is False
    assert result.policy_decision == "answered"
    assert len(result.excerpts) == 1
    excerpt = result.excerpts[0]
    assert excerpt.chunk_id == "bnss:43"
    assert excerpt.text == BNSS_RESULT["text"]  # exact retrieved text, nothing paraphrased
    assert excerpt.citation["unit"] == "Section 43"


# --- multiple / conflicting sources -----------------------------------


def test_multiple_sources_returned_as_separate_excerpts_not_merged():
    result = build_legal_answer([BNSS_RESULT, CONSTITUTION_RESULT])
    assert result.abstained is False
    assert len(result.excerpts) == 2  # never merged into one synthesized answer
    chunk_ids = {e.chunk_id for e in result.excerpts}
    assert chunk_ids == {"bnss:43", "constitution:21"}


def test_multiple_sources_are_all_labeled_in_sources_field():
    result = build_legal_answer([BNSS_RESULT, CONSTITUTION_RESULT])
    assert result.sources == sorted(
        ["Bharatiya Nagarik Suraksha Sanhita, 2023", "Constitution of India"]
    )


def test_single_source_results_have_one_source_label():
    result = build_legal_answer([BNSS_RESULT])
    assert result.sources == ["Bharatiya Nagarik Suraksha Sanhita, 2023"]


# --- mode-aware confidence gate (hybrid gates on dense_score, not RRF score) --


def test_hybrid_result_gates_on_dense_score_not_fused_score(monkeypatch):
    """A hybrid RRF fused score (~0.03) would fail the bm25-scale 3.0
    floor if compared directly -- the gate must use dense_score for
    hybrid results instead. See _passes_confidence_gate's docstring for
    why the fused score itself is not a usable confidence signal."""
    monkeypatch.delenv("LEGAL_CHAT_MIN_SCORE", raising=False)
    hybrid_result = {
        **BNSS_RESULT,
        "score": 0.0328,  # a typical fused RRF score -- tiny, not bm25-scale
        "retrieval_mode": "hybrid",
        "dense_score": 0.9,  # well above the 0.45 hybrid floor
    }
    result = build_legal_answer([hybrid_result])
    assert result.abstained is False


def test_hybrid_result_abstains_on_low_dense_score_despite_high_fused_rank():
    hybrid_result = {
        **BNSS_RESULT,
        "score": 0.0328,  # highest possible-looking fused score
        "retrieval_mode": "hybrid",
        "dense_score": 0.1,  # weak semantic match -- below the floor
    }
    result = build_legal_answer([hybrid_result])
    assert result.abstained is True
    assert result.reason == "insufficient_evidence"


def test_hybrid_gate_floor_holds_at_the_measured_abstain_ceiling(monkeypatch):
    """The hybrid floor is 0.41, chosen in M12 against the production
    path (retrieval on normalised text), where the highest score any
    should-abstain query in the 362-row labelled pool reaches is 0.399.
    This pins both sides of the floor: a score at the measured abstain
    ceiling must abstain, a score just above the floor must answer.

    History: the original 0.42 floor was pinned here against the
    "register a company" stress case (dense 0.4117 on the raw query).
    That case is caught by the topic-relevance guard before the gate
    today -- test_out_of_domain_company_registration_still_abstains
    below keeps the end-to-end behaviour pinned -- so the gate-level pin
    moved to the floor the production-path measurement justifies.
    """
    monkeypatch.delenv("LEGAL_CHAT_MIN_SCORE", raising=False)
    at_ceiling = {**BNSS_RESULT, "score": 0.0328, "retrieval_mode": "hybrid", "dense_score": 0.399}
    assert build_legal_answer([at_ceiling]).abstained is True

    just_above = {**BNSS_RESULT, "score": 0.0328, "retrieval_mode": "hybrid", "dense_score": 0.411}
    assert build_legal_answer([just_above]).abstained is False


def test_out_of_domain_company_registration_still_abstains():
    """End-to-end pin for the historical 0.4117 false-answer case: the
    topic-relevance guard refuses company registration before retrieval,
    so the gate floor's history (0.42 -> 0.41) cannot resurface it."""
    from app.generation.pipeline import handle_legal_query

    result = handle_legal_query("How do I register a company in India?")
    assert result.abstained is True
    assert (result.reason or "").startswith("out_of_domain_")
