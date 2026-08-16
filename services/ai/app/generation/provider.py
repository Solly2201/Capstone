"""LLM provider abstraction for Module 1B.

The generation/RAG pipeline must depend only on this interface, never
on a specific vendor SDK. `get_provider()` selects an implementation
from the `LLM_PROVIDER` environment variable so swapping providers is
a config change, not a code change. Only a deterministic mock
implementation exists so far -- a real provider is wired in Batch 5,
once one is actually selected.
"""
from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ChatMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


class LLMProvider(ABC):
    """Anything that can turn a message list into a text completion."""

    @abstractmethod
    def generate(self, messages: list[ChatMessage]) -> str:
        raise NotImplementedError


class MockLLMProvider(LLMProvider):
    """Deterministic provider for tests and local development.

    Returns a fixed or caller-supplied response, never calls a network
    API. `response` may be a plain string (returned as-is for every
    call) or a callable taking the message list and returning a string
    (for tests that need the response to depend on the given context).
    """

    def __init__(self, response: str | None = None, response_fn=None):
        if response is not None and response_fn is not None:
            raise ValueError("Pass either response or response_fn, not both.")
        self._response = response
        self._response_fn = response_fn

    def generate(self, messages: list[ChatMessage]) -> str:
        if self._response_fn is not None:
            return self._response_fn(messages)
        if self._response is not None:
            return self._response
        return "No verified information found."


def get_provider() -> LLMProvider:
    """Select a provider from the LLM_PROVIDER env var (default: mock).

    Real providers (e.g. "anthropic", "openai") are intentionally not
    implemented yet -- see the Batch 5 plan. Requesting one now fails
    loudly rather than silently falling back to the mock.
    """
    name = os.environ.get("LLM_PROVIDER", "mock").strip().lower()
    if name == "mock":
        return MockLLMProvider()
    raise NotImplementedError(
        f"LLM_PROVIDER={name!r} is not implemented yet. Only 'mock' is available "
        f"until a real provider is selected and wired in (Module 1B Batch 5)."
    )
