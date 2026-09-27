"""Central AI orchestration layer for provider fallback and reliability."""

from typing import Any

from .fallback_provider import FallbackProvider
from .gemini_service import GeminiService, GeminiServiceError


class AIOrchestrator:
    """Coordinate primary and optional fallback AI providers."""

    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        fallback_provider: FallbackProvider | None = None,
    ) -> None:
        self.gemini = gemini_service or GeminiService()
        self.fallback = fallback_provider

    def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        """Generate text using Gemini, then fallback if Gemini fails."""

        try:
            return self.gemini.generate_text(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                json_mode=json_mode,
            )
        except GeminiServiceError:
            if self.fallback is None:
                raise

            return self.fallback.generate_text(
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
        """Generate JSON using Gemini, then fallback if Gemini fails."""

        try:
            return self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
            )
        except GeminiServiceError:
            if self.fallback is None:
                raise

            return self.fallback.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
            )