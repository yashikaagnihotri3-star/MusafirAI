"""Central AI orchestration layer for provider fallback and reliability."""

from typing import Any

from .gemini_service import GeminiService, GeminiServiceError


class AIOrchestrator:
    """
    Coordinate AI requests through the primary provider.

    Fallback provider and caching will be added in later phases.
    """

    def __init__(
        self,
        gemini_service: GeminiService | None = None,
    ) -> None:
        self.gemini = gemini_service or GeminiService()

    def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        """Generate text through the configured primary AI provider."""

        return self.gemini.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            json_mode=json_mode,
        )

    def generate_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
    ) -> dict[str, Any] | list[Any]:
        """Generate and parse JSON through the configured primary provider."""

        return self.gemini.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
        )