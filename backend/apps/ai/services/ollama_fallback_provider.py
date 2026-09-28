"""Local Ollama fallback provider for MusafirAI."""

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

from .gemini_service import GeminiServiceError


class OllamaFallbackProvider:
    """Generate AI responses locally through the Ollama HTTP API."""

    def __init__(self) -> None:
        self.base_url = getattr(
            settings,
            "OLLAMA_BASE_URL",
            "http://127.0.0.1:11434",
        ).rstrip("/")
        self.model = getattr(settings, "OLLAMA_MODEL", "qwen3:4b")

    def _generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int,
        temperature: float,
        json_mode: bool = False,
    ) -> str:
        prompt = (
            f"System instructions:\n{system_prompt}\n\n"
            f"User request:\n{user_prompt}"
        )

        payload: dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "think": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }

        if json_mode:
            payload["format"] = "json"

        request = Request(
            f"{self.base_url}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlopen(request, timeout=120) as response:
                result = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            raise GeminiServiceError(
                code="fallback_provider_unavailable",
                message="The local Ollama fallback provider is unavailable.",
                status_code=503,
            ) from exc
        except json.JSONDecodeError as exc:
            raise GeminiServiceError(
                code="fallback_invalid_response",
                message="The local Ollama fallback returned an invalid response.",
                status_code=502,
            ) from exc

        output = result.get("response")
        if not isinstance(output, str) or not output.strip():
            raise GeminiServiceError(
                code="fallback_empty_response",
                message="The local Ollama fallback returned an empty response.",
                status_code=502,
            )

        return output.strip()

    def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        return self._generate(
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
        output = self._generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            json_mode=True,
        )

        try:
            parsed = json.loads(output)
        except json.JSONDecodeError as exc:
            raise GeminiServiceError(
                code="fallback_invalid_json",
                message="The local Ollama fallback returned invalid JSON.",
                status_code=502,
            ) from exc

        if not isinstance(parsed, (dict, list)):
            raise GeminiServiceError(
                code="fallback_invalid_json",
                message="The local Ollama fallback returned an unsupported JSON value.",
                status_code=502,
            )

        return parsed


