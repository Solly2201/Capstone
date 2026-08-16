"""Module 1B Batch 1: provider interface, mock provider, context assembly.

No real LLM is called anywhere in this file or in the code it tests --
that is intentionally deferred to Batch 5.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.generation.context import build_messages  # noqa: E402
from app.generation.provider import ChatMessage, MockLLMProvider, get_provider  # noqa: E402

SAMPLE_RESULTS = [
    {
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
    },
    {
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
    },
]


def test_mock_provider_returns_fixed_response():
    provider = MockLLMProvider(response="fixed answer")
    assert provider.generate([ChatMessage(role="user", content="anything")]) == "fixed answer"


def test_mock_provider_default_response_is_abstention():
    provider = MockLLMProvider()
    assert provider.generate([]) == "No verified information found."


def test_mock_provider_response_fn_sees_messages():
    provider = MockLLMProvider(response_fn=lambda messages: f"saw {len(messages)} messages")
    result = provider.generate([ChatMessage(role="system", content="x"), ChatMessage(role="user", content="y")])
    assert result == "saw 2 messages"


def test_mock_provider_rejects_both_response_and_response_fn():
    try:
        MockLLMProvider(response="a", response_fn=lambda m: "b")
        assert False, "expected ValueError"
    except ValueError:
        pass


def test_get_provider_defaults_to_mock(monkeypatch):
    monkeypatch.delenv("LLM_PROVIDER", raising=False)
    provider = get_provider()
    assert isinstance(provider, MockLLMProvider)


def test_get_provider_rejects_unimplemented_real_provider(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    try:
        get_provider()
        assert False, "expected NotImplementedError"
    except NotImplementedError:
        pass


def test_build_messages_produces_system_and_user_messages():
    messages, index_map = build_messages("What happens when I'm arrested?", SAMPLE_RESULTS)
    assert [m.role for m in messages] == ["system", "user"]
    assert "arrested" in messages[1].content


def test_build_messages_numbers_context_by_index():
    messages, index_map = build_messages("q", SAMPLE_RESULTS)
    user_content = messages[1].content
    assert "[1] Bharatiya Nagarik Suraksha Sanhita, 2023, Section 43" in user_content
    assert "[2] Constitution of India, Article 21" in user_content


def test_build_messages_index_map_resolves_to_real_citations():
    _, index_map = build_messages("q", SAMPLE_RESULTS)
    assert index_map[1]["chunk_id"] == "bnss:43"
    assert index_map[1]["citation"]["unit"] == "Section 43"
    assert index_map[2]["chunk_id"] == "constitution:21"


def test_build_messages_handles_empty_results_without_crashing():
    messages, index_map = build_messages("q", [])
    assert index_map == {}
    assert "no context retrieved" in messages[1].content
