"""Heritage guide and Q&A generation with strict response validation."""

from typing import Any

from .gemini_service import GeminiService, GeminiServiceError


class HeritageResponseValidationError(GeminiServiceError):
    """Raised for structurally invalid provider content."""

    def __init__(self) -> None:
        super().__init__(
            "invalid_ai_response",
            "The AI provider returned heritage information in an invalid format. Please try again.",
            status_code=502,
        )


class HeritageService:
    """Owns heritage-specific prompts, provider calls, and response validation."""

    def __init__(self, gemini_service: GeminiService | None = None) -> None:
        self.gemini_service = gemini_service or GeminiService()

    def generate_guide(self, request_data: dict[str, str]) -> dict[str, Any]:
        """Generate concise, caveated cultural context for a place."""
        response = self.gemini_service.generate_json(
            system_prompt=self._guide_system_prompt(),
            user_prompt=(
                f"Place: {request_data['place']}\n"
                f"Visitor question: {request_data['question']}"
            ),
            max_tokens=1800,
            temperature=0.1,
        )
        return self.validate_guide(response, request_data["place"])

    def answer_question(self, request_data: dict[str, str]) -> dict[str, Any]:
        """Answer a visitor question while retaining uncertainty where appropriate."""
        response = self.gemini_service.generate_json(
            system_prompt=self._question_system_prompt(),
            user_prompt=(
                f"Place: {request_data['place']}\n"
                f"Question: {request_data['question']}"
            ),
            max_tokens=800,
            temperature=0.1,
        )
        return self.validate_answer(response, request_data)

    @staticmethod
    def _guide_system_prompt() -> str:
        return """You are MusafirAI's concise heritage and culture guide for India. Return only JSON, with no Markdown or extra keys:
{"place":"string","known":true,"history":"string","architecture":"string","cultural_significance":"string","important_facts":["string"],"local_stories":["string"],"traditions":["string"],"local_tips":["string"],"dos":["string"],"donts":["string"]}
If the place cannot be confidently identified, set known to false. In that case state this clearly in history and use empty strings or lists for unsupported details. Do not invent historical claims. For known places, distinguish documented facts from local tradition or uncertain accounts, and use wording such as "local tradition holds" where evidence is uncertain. Keep every string concise and practical for a frontend."""

    @staticmethod
    def _question_system_prompt() -> str:
        return """You are MusafirAI's heritage Q&A guide for India. Return only JSON, with no Markdown or extra keys:
{"place":"string","question":"string","known":true,"answer":"string"}
Answer concisely. If the place cannot be confidently identified, set known to false and say that reliable heritage information could not be confirmed. Do not present uncertain history, oral tradition, or speculation as guaranteed fact; label uncertainty clearly."""

    @classmethod
    def validate_guide(cls, response: Any, requested_place: str) -> dict[str, Any]:
        """Validate and normalize guide content before it reaches the API response."""
        fields = (
            "history", "architecture", "cultural_significance", "important_facts",
            "local_stories", "traditions", "local_tips", "dos", "donts",
        )
        if not isinstance(response, dict) or not cls._matches_place(response.get("place"), requested_place):
            raise HeritageResponseValidationError()
        known = response.get("known")
        if not isinstance(known, bool):
            raise HeritageResponseValidationError()

        validated = {"place": requested_place, "known": known}
        for field in fields[:3]:
            value = response.get(field)
            if not isinstance(value, str) or len(value.strip()) > 1000:
                raise HeritageResponseValidationError()
            validated[field] = value.strip()
        for field in fields[3:]:
            value = response.get(field)
            if not isinstance(value, list) or len(value) > 8 or not all(
                isinstance(item, str) and item.strip() and len(item.strip()) <= 300 for item in value
            ):
                raise HeritageResponseValidationError()
            validated[field] = [item.strip() for item in value]
        return validated

    @classmethod
    def validate_answer(cls, response: Any, request_data: dict[str, str]) -> dict[str, Any]:
        """Validate and normalize a heritage Q&A response."""
        if (
            not isinstance(response, dict)
            or not cls._matches_place(response.get("place"), request_data["place"])
            or response.get("question") != request_data["question"]
            or not isinstance(response.get("known"), bool)
            or not isinstance(response.get("answer"), str)
            or not response["answer"].strip()
            or len(response["answer"].strip()) > 1500
        ):
            raise HeritageResponseValidationError()
        return {
            "place": request_data["place"],
            "question": request_data["question"],
            "known": response["known"],
            "answer": response["answer"].strip(),
        }

    @staticmethod
    def _matches_place(value: Any, requested_place: str) -> bool:
        return isinstance(value, str) and value.strip().casefold() == requested_place.casefold()
