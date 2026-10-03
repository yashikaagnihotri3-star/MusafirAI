"""Personalized itinerary generation and validation."""

from datetime import datetime
from typing import Any

from apps.ai.models import Itinerary
from .ai_orchestrator import AIOrchestrator
from .gemini_service import GeminiService, GeminiServiceError


class ItineraryResponseValidationError(GeminiServiceError):
    """Raised when AI JSON is valid but breaks the itinerary contract."""

    def __init__(self) -> None:
        super().__init__(
            "invalid_ai_response",
            "The AI provider returned an itinerary in an invalid format. Please try again.",
            status_code=502,
        )


class ItineraryService:
    """Owns itinerary-specific prompts and response validation."""

    def __init__(
        self,
        ai_orchestrator: AIOrchestrator | None = None,
        gemini_service: GeminiService | None = None,
    ) -> None:
        if ai_orchestrator is not None:
            self.ai_orchestrator = ai_orchestrator
        elif gemini_service is not None:
            self.ai_orchestrator = AIOrchestrator(
                gemini_service=gemini_service
            )
        else:
            self.ai_orchestrator = AIOrchestrator()

    def generate(self, preferences: dict[str, Any]) -> dict[str, Any]:
        """Generate a validated itinerary with repair and stored fallback."""
        system_prompt, user_prompt = self._build_prompts(preferences)

        try:
            response = self.ai_orchestrator.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                max_tokens=4000,
                temperature=0.2,
            )

            try:
                return self.validate_itinerary(response, preferences)
            except ItineraryResponseValidationError:
                repair_prompt = (
                    "The previous itinerary JSON failed validation. "
                    "Return corrected JSON only. Do not include Markdown, explanations, "
                    "reasoning, or code fences. "
                    "Keep the same destination and exactly the same number of days. "
                    "The JSON field 'day' MUST be a JSON integer, never a string. "
                    "Use exactly 1, 2, 3, ... for the day numbers. "
                    "The fields 'duration_minutes', 'estimated_cost', "
                    "'estimated_day_cost', and 'total_estimated_cost' MUST all be JSON "
                    "integers, not strings. "
                    "Each day MUST contain at least one place. "
                    "Each place MUST contain name, time, duration_minutes, "
                    "estimated_cost, and reason. "
                    "Each estimated_day_cost MUST equal the exact sum of the "
                    "estimated_cost values for that day. "
                    "total_estimated_cost MUST equal the exact sum of all "
                    "estimated_day_cost values. "
                    "total_estimated_cost MUST NOT exceed the supplied budget. "
                    "Keep all requested preferred places in the itinerary. "
                    "Do not change the destination, days, budget, or preferred places. "
                    "Return one complete valid itinerary JSON object."
                )

                repaired_response = self.ai_orchestrator.generate_json(
                    system_prompt=system_prompt,
                    user_prompt=f"{user_prompt}\n\n{repair_prompt}",
                    max_tokens=4000,
                    temperature=0.1,
                )

                return self.validate_itinerary(
                    repaired_response,
                    preferences,
                )

        except GeminiServiceError:
            stored_fallback = self.find_stored_fallback(preferences)

            if stored_fallback is not None:
                return stored_fallback

            raise
    def regenerate_day(
        self,
        preferences: dict[str, Any],
        day: int,
        maximum_day_cost: int,
    ) -> dict[str, Any]:
        """Regenerate one day only."""
        system_prompt = (
            "You are MusafirAI's itinerary planner for travel in India. "
            "Return only one JSON object with keys day, places, and "
            "estimated_day_cost. Each place must have name, time in HH:MM, "
            "duration_minutes, estimated_cost, and reason. Include at least "
            "one place. Costs must be non-negative whole INR values, and "
            "estimated_day_cost must equal the sum of place costs."
        )

        user_prompt = (
            f"Regenerate day {day} for {preferences['destination']}.\n"
            f"Interests: {', '.join(preferences['interests'])}\n"
            f"Travel style: {preferences['travel_style']}\n"
            f"Travel pace: {preferences['travel_pace']}\n"
            f"Preferred places: {', '.join(preferences.get('preferred_places', [])) or 'None'}\n"
            f"Maximum allowed cost for this day in INR: {maximum_day_cost}"
        )

        response = self.ai_orchestrator.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1800,
            temperature=0.2,
        )

        validated_day = self.validate_day(response, day)

        if validated_day["estimated_day_cost"] > maximum_day_cost:
            raise ItineraryResponseValidationError()

        return validated_day

    @staticmethod
    def find_stored_fallback(preferences: dict[str, Any]) -> dict[str, Any] | None:
        """Return a matching stored itinerary for AI failure recovery."""
        candidates = Itinerary.objects.filter(
            destination__iexact=preferences["destination"],
            days=preferences["days"],
            budget__gte=preferences["budget"],
            travel_style=preferences["travel_style"],
            travel_pace=preferences["travel_pace"],
        ).order_by("-updated_at")

        for itinerary in candidates:
            if (
                itinerary.interests == preferences["interests"]
                and itinerary.preferred_places == preferences.get("preferred_places", [])
            ):
                return {
                    "destination": itinerary.destination,
                    "days": itinerary.days,
                    "total_estimated_cost": itinerary.total_estimated_cost,
                    "itinerary": itinerary.itinerary,
             }

        return None
    
    @staticmethod
    def _build_prompts(
        preferences: dict[str, Any],
    ) -> tuple[str, str]:
        system_prompt = """You are MusafirAI's itinerary planner for travel in India.
Return only a JSON object with no Markdown, commentary, or extra keys. The object must exactly use:
{
  "destination": "string",
  "days": integer,
  "total_estimated_cost": integer,
  "itinerary": [
    {
      "day": integer,
      "places": [
        {
          "name": "string",
          "time": "HH:MM",
          "duration_minutes": integer,
          "estimated_cost": integer,
          "reason": "string"
        }
      ],
      "estimated_day_cost": integer
    }
  ]
}
Create one entry for every requested day, numbered consecutively from 1. Include at least one place per day.
All costs must be whole non-negative INR amounts. Each estimated_day_cost must equal the sum of its
places' estimated_cost values; total_estimated_cost must equal the sum of all estimated_day_cost values
and must not exceed the supplied budget. Do not invent booking confirmations, operating hours, or reservations."""

        user_prompt = (
            "Create an itinerary using these validated preferences:\n"
            f"Destination: {preferences['destination']}\n"
            f"Days: {preferences['days']}\n"
            f"Budget in INR: {preferences['budget']}\n"
            f"Interests: {', '.join(preferences['interests'])}\n"
            f"Travel style: {preferences['travel_style']}\n"
            f"Travel pace: {preferences['travel_pace']}\n"
            f"Preferred places: {', '.join(preferences.get('preferred_places', [])) or 'None'}"
        )

        return system_prompt, user_prompt

    @classmethod
    def validate_itinerary(
        cls,
        response: Any,
        preferences: dict[str, Any],
    ) -> dict[str, Any]:
        """Validate a complete itinerary."""
        return cls._validate_response(response, preferences)

    @classmethod
    def validate_day(
        cls,
        day_plan: Any,
        expected_day: int,
    ) -> dict[str, Any]:
        """Validate one day."""
        return cls._validate_day(day_plan, expected_day)

    @classmethod
    def validate_place(
        cls,
        place: Any,
    ) -> dict[str, Any]:
        """Validate one place."""
        return cls._validate_place(place)

    @classmethod
    def _validate_response(
        cls,
        response: Any,
        preferences: dict[str, Any],
    ) -> dict[str, Any]:
        if not isinstance(response, dict):
            raise ItineraryResponseValidationError()

        destination = response.get("destination")
        days = response.get("days")
        itinerary = response.get("itinerary")
        total_cost = cls._valid_cost(
            response.get("total_estimated_cost")
        )

        if (
            not isinstance(destination, str)
            or destination.strip().casefold()
            != preferences["destination"].casefold()
            or not cls._is_int(days)
            or days != preferences["days"]
            or total_cost is None
            or total_cost > preferences["budget"]
            or not isinstance(itinerary, list)
            or len(itinerary) != preferences["days"]
        ):
            raise ItineraryResponseValidationError()

        validated_days = []
        total_day_cost = 0

        for expected_day, day_plan in enumerate(
            itinerary,
            start=1,
        ):
            validated_day = cls._validate_day(
                day_plan,
                expected_day,
            )
            validated_days.append(validated_day)
            total_day_cost += validated_day["estimated_day_cost"]

        calculated_total_cost = total_day_cost

        if calculated_total_cost > preferences["budget"]:
            raise ItineraryResponseValidationError()

        return {
            "destination": preferences["destination"],
            "days": preferences["days"],
            "total_estimated_cost": calculated_total_cost,
            "itinerary": validated_days,
       }
 
    @classmethod
    def _validate_day(
        cls,
        day_plan: Any,
        expected_day: int,
    ) -> dict[str, Any]:
        if (
            not isinstance(day_plan, dict)
            or day_plan.get("day") != expected_day
        ):
            raise ItineraryResponseValidationError()

        places = day_plan.get("places")
        day_cost = cls._valid_cost(
            day_plan.get("estimated_day_cost")
        )

        if (
            not isinstance(places, list)
            or not places
            or day_cost is None
        ):
            raise ItineraryResponseValidationError()

        validated_places = [
            cls._validate_place(place)
            for place in places
        ]

        if day_cost != sum(
            place["estimated_cost"]
            for place in validated_places
        ):
            raise ItineraryResponseValidationError()

        return {
            "day": expected_day,
            "places": validated_places,
            "estimated_day_cost": day_cost,
        }

    @classmethod
    def _validate_place(
        cls,
        place: Any,
    ) -> dict[str, Any]:
        if not isinstance(place, dict):
            raise ItineraryResponseValidationError()

        name = place.get("name")
        time = place.get("time")
        duration = place.get("duration_minutes")
        cost = cls._valid_cost(
            place.get("estimated_cost")
        )
        reason = place.get("reason")

        if (
            not isinstance(name, str)
            or not name.strip()
            or not isinstance(time, str)
            or not cls._valid_time(time)
            or not cls._is_int(duration)
            or not 1 <= duration <= 1440
            or cost is None
            or not isinstance(reason, str)
            or not reason.strip()
        ):
            raise ItineraryResponseValidationError()

        return {
            "name": name.strip(),
            "time": time,
            "duration_minutes": duration,
            "estimated_cost": cost,
            "reason": reason.strip(),
        }

    @staticmethod
    def _is_int(value: Any) -> bool:
        return isinstance(value, int) and not isinstance(value, bool)

    @classmethod
    def _valid_cost(
        cls,
        value: Any,
    ) -> int | None:
        return (
            value
            if cls._is_int(value) and value >= 0
            else None
        )

    @staticmethod
    def _valid_time(value: str) -> bool:
        try:
            datetime.strptime(value, "%H:%M")
        except ValueError:
            return False

        return True