"""Fallback AI provider abstraction for MusafirAI."""

from typing import Any, Protocol


class FallbackProvider(Protocol):
    """Interface that any fallback AI provider must implement."""

    def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        """Generate text from a fallback provider."""
        ...

    def generate_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
    ) -> dict[str, Any] | list[Any]:
        """Generate JSON from a fallback provider."""
        ...