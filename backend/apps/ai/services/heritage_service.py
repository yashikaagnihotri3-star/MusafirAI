"""Heritage guide and Q&A generation with strict response validation."""

from typing import Any

from .ai_orchestrator import AIOrchestrator
from .gemini_service import GeminiServiceError


TRUSTED_PLACE_CONTEXT = {
    "forest research institute": {
        "city": "Dehradun",
        "state": "Uttarakhand",
        "country": "India",
        "verified_facts": [
            "The Forest Research Institute is located in Dehradun, Uttarakhand, India.",
            "It is a major institution for forestry research and education in India.",
            "Its historic main building is associated with Greco-Roman and colonial architectural influences.",
        ],
    },
}

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

    def __init__(
        self,
        ai_orchestrator: AIOrchestrator | None = None,
        gemini_service=None,
    ) -> None:
        if ai_orchestrator is not None:
            self.ai_orchestrator = ai_orchestrator
        elif gemini_service is not None:
            self.ai_orchestrator = AIOrchestrator(
                gemini_service=gemini_service
            )
        else:
            self.ai_orchestrator = AIOrchestrator()
   
    @staticmethod
    def _trusted_guide(
        request_data: dict[str, str],
    ) -> dict[str, Any] | None:
        """Return deterministic heritage facts for supported places."""
        context = TRUSTED_PLACE_CONTEXT.get(
            request_data["place"].casefold()
        )

        if not context or "verified_facts" not in context:
            return None

        return {
            "place": request_data["place"],
            "known": True,
            "history": context["verified_facts"][0],
            "architecture": context["verified_facts"][2],
            "cultural_significance": context["verified_facts"][1],
            "important_facts": context["verified_facts"],
            "local_stories": [],
            "traditions": [],
            "local_tips": [],
            "dos": [],
            "donts": [],
        }
    
    def generate_guide(
        self,
        request_data: dict[str, str],
    ) -> dict[str, Any]:
        """Generate concise, caveated cultural context for a place."""
        trusted_guide = self._trusted_guide(request_data)

        if trusted_guide is not None:
            return trusted_guide

        response = self.ai_orchestrator.generate_json(
            system_prompt=self._guide_system_prompt(),
            user_prompt=(
                f"Place: {request_data['place']}\n"
                f"Visitor question: {request_data['question']}\n"
                f"Trusted location context: "
                f"{TRUSTED_PLACE_CONTEXT.get(request_data['place'].casefold(), 'No trusted context available')}"
            ),
            max_tokens=1800,
            temperature=0.1,
        )

        return self.validate_guide(
            response,
            request_data["place"],
        )

    def answer_question(
        self,
        request_data: dict[str, str],
    ) -> dict[str, Any]:
        """Answer a visitor question while retaining uncertainty."""
        response = self.ai_orchestrator.generate_json(
            system_prompt=self._question_system_prompt(),
            user_prompt=(
                f"Place: {request_data['place']}\n"
                f"Question: {request_data['question']}\n"
                f"Trusted location context: "
                f"{TRUSTED_PLACE_CONTEXT.get(request_data['place'].casefold(), 'No trusted context available')}"
          ),
            max_tokens=800,
            temperature=0.1,
        )

        return self.validate_answer(
            response,
            request_data,
        )

    @staticmethod
    def _guide_system_prompt() -> str:
        return """You are MusafirAI's concise heritage and culture guide for India.

Return ONLY one valid JSON object.
Do not return Markdown, explanations, comments, or extra keys.

IMPORTANT:
- The "place" value MUST exactly match the place name supplied by the user.
- Do not add a city, state, country, or other text to the place value.
- All required keys must be present.
- Keep all strings concise.
- Do not invent facts.
- Do not create fake dates, names, events, traditions, or websites.
- If uncertain about a historical detail, clearly label the uncertainty.

Required JSON structure:

{
  "place": "exact user-provided place name",
  "known": true,
  "history": "string",
  "architecture": "string",
  "cultural_significance": "string",
  "important_facts": ["string"],
  "local_stories": ["string"],
  "traditions": ["string"],
  "local_tips": ["string"],
  "dos": ["string"],
  "donts": ["string"]
}

If the place cannot be confidently identified:
- set "known" to false
- explain the uncertainty in "history"
- use empty strings or empty lists for unsupported information.

For known places, distinguish documented facts from local traditions.
Use wording such as "local tradition holds" when a claim is uncertain.

The response must contain valid JSON only."""

    @staticmethod
    def _question_system_prompt() -> str:
        return """You are MusafirAI's heritage Q&A guide for India.

Return ONLY one valid JSON object.
Do not return Markdown, explanations, comments, or extra keys.

The "place" value MUST exactly match the place name supplied by the user.
The "question" value MUST exactly match the question supplied by the user.

Required JSON structure:

{
  "place": "exact user-provided place name",
  "question": "exact user-provided question",
  "known": true,
  "answer": "string"
}

Answer concisely.

A trusted location context may be supplied in the user request.
If trusted location context is present, treat it as authoritative.
Never replace, contradict, or reinterpret the trusted city, state, or country.
Do not introduce a different city or location unless it is explicitly supported by the trusted context.

If the place cannot be confidently identified:
- set "known" to false
- say that reliable heritage information could not be confirmed.

Do not present uncertain history, oral tradition, or speculation as guaranteed fact.
Label uncertainty clearly.

The response must contain valid JSON only."""

    @classmethod
    def validate_guide(
        cls,
        response: Any,
        requested_place: str,
    ) -> dict[str, Any]:
        """Validate and normalize guide content."""
        fields = (
            "history",
            "architecture",
            "cultural_significance",
            "important_facts",
            "local_stories",
            "traditions",
            "local_tips",
            "dos",
            "donts",
        )

        if (
            not isinstance(response, dict)
            or not cls._matches_place(
                response.get("place"),
                requested_place,
            )
        ):
            raise HeritageResponseValidationError()

        known = response.get("known")

        if not isinstance(known, bool):
            raise HeritageResponseValidationError()

        validated = {
            "place": requested_place,
            "known": known,
        }

        for field in fields[:3]:
            value = response.get(field)

            if (
                not isinstance(value, str)
                or len(value.strip()) > 1000
            ):
                raise HeritageResponseValidationError()

            validated[field] = value.strip()

        for field in fields[3:]:
            value = response.get(field)

            if (
                not isinstance(value, list)
                or len(value) > 8
                or not all(
                    isinstance(item, str)
                    and item.strip()
                    and len(item.strip()) <= 300
                    for item in value
                )
            ):
                raise HeritageResponseValidationError()

            validated[field] = [
                item.strip()
                for item in value
            ]

        return validated

    @classmethod
    def validate_answer(
        cls,
        response: Any,
        request_data: dict[str, str],
    ) -> dict[str, Any]:
        """Validate and normalize a heritage Q&A response."""
        if (
            not isinstance(response, dict)
            or not cls._matches_place(
                response.get("place"),
                request_data["place"],
            )
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
    def _matches_place(
        value: Any,
        requested_place: str,
    ) -> bool:
        return (
            isinstance(value, str)
            and value.strip().casefold()
            == requested_place.casefold()
        )
