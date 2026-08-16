"""Module 1B Batch 2: confidence gate, citation validation, abstention,
insufficient/conflicting-evidence handling. Still mock-provider only --
no real LLM call anywhere in this file.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.pipeline import answer_question  # noqa: E402
from app.generation.provider import MockLLMProvider  # noqa: E402

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


def _tracking_provider(response_text: str):
    calls = []

    def response_fn(messages):
        calls.append(messages)
        return response_text

    return MockLLMProvider(response_fn=response_fn), calls


# --- confidence gate / insufficient evidence -------------------------------


def test_empty_results_abstain_without_calling_provider():
    provider, calls = _tracking_provider("should never be returned")
    result = answer_question("what is bail?", [], provider)
    assert result.abstained is True
    assert result.reason == "no_matching_content"
    assert result.citations == []
    assert calls == []


def test_low_score_results_abstain_without_calling_provider():
    provider, calls = _tracking_provider("should never be returned")
    result = answer_question("what is bail?", [WEAK_RESULT], provider)
    assert result.abstained is True
    assert result.reason == "insufficient_evidence"
    assert calls == []


def test_min_score_env_var_overrides_default(monkeypatch):
    # Score 0.5 fails the default floor (3.0) but should pass a lowered one.
    monkeypatch.setenv("LEGAL_CHAT_MIN_SCORE", "0.1")
    provider, _ = _tracking_provider("An answer grounded in the source [1].")
    result = answer_question("q", [WEAK_RESULT], provider)
    assert result.abstained is False


def test_min_score_env_var_can_raise_the_floor(monkeypatch):
    # Score 15.39 passes the default floor but should fail a raised one.
    monkeypatch.setenv("LEGAL_CHAT_MIN_SCORE", "100")
    provider, calls = _tracking_provider("should never be returned")
    result = answer_question("q", [BNSS_RESULT], provider)
    assert result.abstained is True
    assert calls == []


# --- citation/index validation ---------------------------------------------


def test_valid_citation_is_preserved():
    provider, _ = _tracking_provider(
        "Women cannot generally be arrested after sunset or before sunrise [1]."
    )
    result = answer_question("q", [BNSS_RESULT], provider)
    assert result.abstained is False
    assert len(result.citations) == 1
    assert result.citations[0]["chunk_id"] == "bnss:43"
    assert result.citations[0]["citation"]["unit"] == "Section 43"


def test_out_of_range_citation_is_dropped_and_treated_as_ungrounded():
    provider, _ = _tracking_provider("This is true [7].")  # index 7 was never given
    result = answer_question("q", [BNSS_RESULT], provider)
    assert result.abstained is True
    assert result.reason == "ungrounded_response"
    assert result.citations == []


def test_answer_with_no_citation_at_all_is_ungrounded():
    provider, _ = _tracking_provider("This is just an unsupported claim with no citation.")
    result = answer_question("q", [BNSS_RESULT], provider)
    assert result.abstained is True
    assert result.reason == "ungrounded_response"


def test_mixed_valid_and_invalid_citations_keeps_only_valid():
    provider, _ = _tracking_provider("First point [1]. Second, unsupported point [9].")
    result = answer_question("q", [BNSS_RESULT], provider)
    assert result.abstained is False
    assert len(result.citations) == 1
    assert result.citations[0]["chunk_id"] == "bnss:43"


# --- conflicting evidence (multiple sources) --------------------------------


def test_multi_source_prompt_clause_present_when_sources_differ():
    provider, calls = _tracking_provider("Both apply [1][2].")
    answer_question("q", [BNSS_RESULT, CONSTITUTION_RESULT], provider)
    system_message = calls[0][0]
    assert "more than one legal source" in system_message.content


def test_single_source_prompt_has_no_multi_source_clause():
    provider, calls = _tracking_provider("Applies [1].")
    answer_question("q", [BNSS_RESULT], provider)
    system_message = calls[0][0]
    assert "more than one legal source" not in system_message.content


def test_conflicting_sources_both_citations_preserved_separately():
    """When the model cites two differing sources, both must survive
    validation, distinctly and unmerged -- CAP never algorithmically
    picks a "winning" source for v1."""
    provider, _ = _tracking_provider(
        "BNSS defines this one way [1], while the Constitution frames it "
        "differently [2]; the sources are not identical on this point."
    )
    result = answer_question("q", [BNSS_RESULT, CONSTITUTION_RESULT], provider)
    assert result.abstained is False
    sources = {c["citation"]["source"] for c in result.citations}
    assert sources == {
        "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "Constitution of India",
    }
    assert len(result.citations) == 2  # not merged into one


def test_conflicting_sources_never_silently_discards_one():
    """If the model only cites one of two differing sources, the pipeline
    itself must not have discarded the other before generation -- both
    were available in context. This checks the assembled prompt, not
    just the final citations, since a model choosing to cite only one
    source is a generation-quality issue, not a pipeline bug."""
    provider, calls = _tracking_provider("Only using one [1].")
    answer_question("q", [BNSS_RESULT, CONSTITUTION_RESULT], provider)
    user_message = calls[0][1]
    assert "Section 43" in user_message.content
    assert "Article 21" in user_message.content
