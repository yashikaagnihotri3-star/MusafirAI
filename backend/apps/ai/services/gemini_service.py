"""Centralized Gemini provider client and safe provider-neutral error handling."""

import json
import time
from typing import Any

import httpx
from django.conf import settings
from google import genai
from google.genai import errors, types


class GeminiServiceError(Exception):
    """A safe, stable error that AI API endpoints may return to clients."""

    def __init__(self, code: str, message: str, status_code: int = 503):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class GeminiService:
    """Centralized Gemini client reused by every MusafirAI feature service."""

    def __init__(self, client: Any | None = None) -> None:
        if client is not None:
            self.client = client
            return

        if not settings.GEMINI_API_KEY:
            raise GeminiServiceError(
                "provider_not_configured",
                "The AI provider is not configured.",
                status_code=503,
            )

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(
                timeout=settings.GEMINI_TIMEOUT_SECONDS * 1000
            ),
        )

    @staticmethod
    def is_configured() -> bool:
        """Return whether a Gemini API key exists without exposing it."""
        return bool(settings.GEMINI_API_KEY)

    def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        """Request Gemini content with retries for temporary provider failures."""

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
            temperature=temperature,
            response_mime_type="application/json" if json_mode else None,
        )

        max_attempts = 3

        for attempt in range(max_attempts):
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=user_prompt,
                    config=config,
                )

                return self._extract_text(response)

            except errors.APIError as error:
                print(
                    f"Gemini API error: code={error.code}, "
                    f"message={error.message}, "
                    f"attempt={attempt + 1}/{max_attempts}"
                )

                if (
                    error.code in {429, 500, 502, 503, 504}
                    and attempt < max_attempts - 1
                ):
                    time.sleep(2 ** attempt)
                    continue

                raise self._map_api_error(error) from error

            except httpx.TimeoutException as error:
                if attempt < max_attempts - 1:
                    print(
                        f"Gemini timeout, retrying "
                        f"attempt={attempt + 1}/{max_attempts}"
                    )
                    time.sleep(2 ** attempt)
                    continue

                raise GeminiServiceError(
                    "provider_timeout",
                    "The AI provider timed out. Please try again.",
                ) from error

            except httpx.RequestError as error:
                if attempt < max_attempts - 1:
                    print(
                        f"Gemini request error, retrying "
                        f"attempt={attempt + 1}/{max_attempts}"
                    )
                    time.sleep(2 ** attempt)
                    continue

                raise GeminiServiceError(
                    "provider_unavailable",
                    "The AI provider is unavailable. Please try again.",
                ) from error

            except GeminiServiceError:
                raise

            except Exception as error:
                raise GeminiServiceError(
                    "provider_request_failed",
                    "The AI provider request failed.",
                ) from error

        raise GeminiServiceError(
            "provider_request_failed",
            "The AI provider request failed.",
        )

    def generate_json(self, **kwargs: Any) -> dict[str, Any] | list[Any]:
        """Request JSON mode and parse it before feature-specific schema validation."""

        response_text = self.generate_text(json_mode=True, **kwargs).strip()

        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError as error:
            raise GeminiServiceError(
                "provider_malformed_response",
                "The AI provider returned an invalid response.",
            ) from error

        if not isinstance(parsed, (dict, list)):
            raise GeminiServiceError(
                "provider_malformed_response",
                "The AI provider returned an invalid response.",
            )

        return parsed

    @staticmethod
    def _map_api_error(error: errors.APIError) -> GeminiServiceError:
        if error.code in {401, 403}:
            return GeminiServiceError(
                "provider_authentication_failed",
                "The AI provider could not authenticate.",
            )

        if error.code == 429:
            return GeminiServiceError(
                "provider_rate_limited",
                "The AI provider is busy. Please try again shortly.",
                429,
            )

        if error.code in {408, 504}:
            return GeminiServiceError(
                "provider_timeout",
                "The AI provider timed out. Please try again.",
            )

        if 500 <= error.code < 600:
            return GeminiServiceError(
                "provider_unavailable",
                "The AI provider is unavailable. Please try again.",
            )

        return GeminiServiceError(
            "provider_request_failed",
            "The AI provider request failed.",
        )

    @staticmethod
    def _extract_text(response: Any) -> str:
        text = getattr(response, "text", None)

        if not isinstance(text, str) or not text.strip():
            raise GeminiServiceError(
                "provider_empty_response",
                "The AI provider returned an empty response.",
            )

        return text.strip()
