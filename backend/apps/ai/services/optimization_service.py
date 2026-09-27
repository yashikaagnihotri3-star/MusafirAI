"""AI itinerary optimization from externally prepared context, without route calculation."""

from typing import Any

from .gemini_service import GeminiService, GeminiServiceError


class OptimizationResponseValidationError(GeminiServiceError):
    """Raised when an optimization result violates the safe response contract."""

    def __init__(self) -> None:
        super().__init__(
            "invalid_ai_response",
            "The AI provider returned an optimization in an invalid format. Please try again.",
            status_code=502,
        )


class OptimizationService:
    """Produces a constrained, validated AI suggestion from prepared itinerary context."""

    def __init__(self, gemini_service: GeminiService | None = None) -> None:
        self.gemini_service = gemini_service or GeminiService()

    def optimize(self, context: dict[str, Any]) -> dict[str, Any]:
        """Ask Gemini to select/reorder supplied places; no routing or external data is used."""
        response = self.gemini_service.generate_json(
            system_prompt=self._system_prompt(),
            user_prompt=self._user_prompt(context),
            max_tokens=1800,
            temperature=0.1,
        )
        return self.validate_response(response, context)

    @staticmethod
    def _system_prompt() -> str:
        return """You are MusafirAI's itinerary optimization assistant. You do not calculate routes, access maps, weather APIs, live availability, or external data. Use only the prepared context supplied by the user.
Return only JSON with no Markdown or extra keys:
{"updated_itinerary":{"places":["string"],"estimated_time_minutes":0,"estimated_cost":0},"removed_places":["string"],"added_places":["string"],"reason":"string","estimated_cost":0}
The updated places must only come from supplied remaining_places, never visited_places or a newly invented place. Respect available_time_minutes and remaining_budget. Use the disruption reason and optional weather/preference context only as supplied; do not claim external facts. estimated_cost must equal updated_itinerary.estimated_cost. Keep reason concise and explain the selection trade-off."""

    @staticmethod
    def _user_prompt(context: dict[str, Any]) -> str:
        return (
            "Prepared optimization context (do not assume information beyond it):\n"
            f"Current itinerary: {context['current_itinerary']}\n"
            f"Visited places: {context['visited_places']}\n"
            f"Remaining places: {context['remaining_places']}\n"
            f"Current location: {context['current_location']}\n"
            f"Available time in minutes: {context['available_time_minutes']}\n"
            f"Remaining budget: {context['remaining_budget']}\n"
            f"Disruption reason: {context['reason']}\n"
            f"Weather context: {context.get('weather_context', {})}\n"
            f"User preferences: {context.get('preferences', {})}"
        )

    @classmethod
    def validate_response(cls, response: Any, context: dict[str, Any]) -> dict[str, Any]:
        """Validate all AI selections against the client-supplied optimization constraints."""
        if not isinstance(response, dict):
            raise OptimizationResponseValidationError()
        updated = response.get("updated_itinerary")
        if not isinstance(updated, dict):
            raise OptimizationResponseValidationError()
        places = updated.get("places")
        time_minutes = updated.get("estimated_time_minutes")
        cost = updated.get("estimated_cost")
        response_cost = response.get("estimated_cost")
        removed = response.get("removed_places")
        added = response.get("added_places")
        reason = response.get("reason")
        if (
            not cls._is_name_list(places)
            or not cls._is_non_negative_int(time_minutes)
            or not cls._is_non_negative_int(cost)
            or response_cost != cost
            or not cls._is_name_list(removed)
            or not cls._is_name_list(added)
            or not isinstance(reason, str)
            or not reason.strip()
            or len(reason.strip()) > 500
        ):
            raise OptimizationResponseValidationError()

        remaining = cls._place_names(context["remaining_places"])
        visited = cls._place_names(context["visited_places"])
        current = cls._place_names(context["current_itinerary"].get("places", []))
        if remaining is None or visited is None or current is None:
            raise OptimizationResponseValidationError()
        normalized_places = [place.strip() for place in places]
        normalized_removed = [place.strip() for place in removed]
        normalized_added = [place.strip() for place in added]
        if (
            len(set(name.casefold() for name in normalized_places)) != len(normalized_places)
            or not cls._subset(normalized_places, remaining)
            or not cls._disjoint(normalized_places, visited)
            or not cls._subset(normalized_removed, current + remaining)
            or not cls._subset(normalized_added, normalized_places)
            or not cls._disjoint(normalized_added, current)
            or time_minutes > context["available_time_minutes"]
            or cost > context["remaining_budget"]
        ):
            raise OptimizationResponseValidationError()

        return {
            "updated_itinerary": {
                "places": normalized_places,
                "estimated_time_minutes": time_minutes,
                "estimated_cost": cost,
            },
            "removed_places": normalized_removed,
            "added_places": normalized_added,
            "reason": reason.strip(),
            "estimated_cost": cost,
        }

    @staticmethod
    def _is_non_negative_int(value: Any) -> bool:
        return isinstance(value, int) and not isinstance(value, bool) and value >= 0

    @staticmethod
    def _is_name_list(value: Any) -> bool:
        return isinstance(value, list) and all(
            isinstance(item, str) and item.strip() and len(item.strip()) <= 150 for item in value
        )

    @classmethod
    def _place_names(cls, values: Any) -> list[str] | None:
        if not isinstance(values, list):
            return None
        names = []
        for value in values:
            if isinstance(value, str) and value.strip():
                names.append(value.strip())
            elif isinstance(value, dict) and isinstance(value.get("name"), str) and value["name"].strip():
                names.append(value["name"].strip())
            else:
                return None
        return names

    @staticmethod
    def _subset(selected: list[str], allowed: list[str]) -> bool:
        allowed_normalized = {item.casefold() for item in allowed}
        return all(item.casefold() in allowed_normalized for item in selected)

    @staticmethod
    def _disjoint(first: list[str], second: list[str]) -> bool:
        second_normalized = {item.casefold() for item in second}
        return all(item.casefold() not in second_normalized for item in first)
