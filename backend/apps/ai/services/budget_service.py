"""AI-powered travel budget estimation service for MusafirAI."""

from typing import Any

from .ai_orchestrator import AIOrchestrator
from .gemini_service import GeminiServiceError


class BudgetResponseValidationError(GeminiServiceError):
    """Raised when the AI returns an invalid budget response."""

    def __init__(self) -> None:
        super().__init__(
            "invalid_budget_response",
            "The AI provider returned an invalid budget estimate. Please try again.",
            status_code=502,
        )


class BudgetService:
    """Generate and validate AI-powered travel budget estimates."""

    REQUIRED_CATEGORIES = {
        "transport",
        "accommodation",
        "food",
        "local_transport",
        "activities",
        "miscellaneous",
    }

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
    def _system_prompt() -> str:
        return (
            "You are MusafirAI's travel budget estimation assistant. "
            "Estimate realistic travel costs in Indian Rupees (INR). "
            "Return valid JSON only. Do not include markdown or explanations "
            "outside the JSON. Never return negative costs. "
            "Use the requested destination, duration, traveller count, "
            "travel style, travel pace, interests, and transport preference. "
            "All monetary values must be non-negative whole INR numbers. "
            "First calculate all six breakdown values, then add them carefully. "
            "Set estimated_total to that exact sum with no adjustment or rounding. "
            "Before returning JSON, verify the six category values sum exactly to "
            "estimated_total. "
            "minimum_budget must not exceed estimated_total, and "
            "maximum_budget must not be less than estimated_total."
        )

    @classmethod
    def _user_prompt(cls, request_data: dict[str, Any]) -> str:
        return (
            "Create a travel budget estimate for:\n"
            f"Destination: {request_data['destination']}\n"
            f"Days: {request_data['days']}\n"
            f"Travellers: {request_data['travellers']}\n"
            f"Travel style: {request_data['travel_style']}\n"
            f"Travel pace: {request_data['travel_pace']}\n"
            f"Interests: {request_data.get('interests', [])}\n"
            f"Transport preference: "
            f"{request_data.get('transport_preference', 'not specified')}\n"
            f"Preferred places: "
            f"{request_data.get('preferred_places', []) or 'None'}\n\n"
            "Return exactly these JSON fields:\n"
            "destination, currency, breakdown, estimated_total, "
            "minimum_budget, maximum_budget, assumptions.\n"
            "The breakdown must contain exactly these categories: "
            "transport, accommodation, food, local_transport, "
            "activities, miscellaneous."
        )

    @classmethod
    def validate_response(
        cls,
        response: Any,
        destination: str,
    ) -> dict[str, Any]:
        if not isinstance(response, dict):
            raise BudgetResponseValidationError()

        required_fields = {
            "destination",
            "currency",
            "breakdown",
            "estimated_total",
            "minimum_budget",
            "maximum_budget",
            "assumptions",
        }

        if not required_fields.issubset(response):
            raise BudgetResponseValidationError()

        if response["destination"] != destination:
            raise BudgetResponseValidationError()

        if response["currency"] != "INR":
            raise BudgetResponseValidationError()

        breakdown = response["breakdown"]

        if not isinstance(breakdown, dict):
            raise BudgetResponseValidationError()

        if set(breakdown) != cls.REQUIRED_CATEGORIES:
            raise BudgetResponseValidationError()

        costs = {}

        for category in cls.REQUIRED_CATEGORIES:
            value = breakdown[category]

            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise BudgetResponseValidationError()

            costs[category] = value
        estimated_total = sum(costs.values())
        minimum_budget = round(estimated_total * 0.9)
        maximum_budget = round(estimated_total * 1.1)
        for value in (
            estimated_total,
            minimum_budget,
            maximum_budget,
        ):
            if (
                isinstance(value, bool)
                or not isinstance(value, int)
                or value < 0
            ):
                raise BudgetResponseValidationError()

        
        if minimum_budget > estimated_total:
            raise BudgetResponseValidationError()

        if maximum_budget < estimated_total:
            raise BudgetResponseValidationError()

        assumptions = response["assumptions"]

        if not isinstance(assumptions, list) or not all(
            isinstance(item, str) and item.strip()
            for item in assumptions
        ):
            raise BudgetResponseValidationError()

        return {
            "destination": destination,
            "currency": "INR",
            "breakdown": costs,
            "estimated_total": estimated_total,
            "minimum_budget": minimum_budget,
            "maximum_budget": maximum_budget,
            "assumptions": assumptions,
        }

    def estimate(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """Generate a validated budget estimate with one repair attempt."""
        system_prompt = self._system_prompt()
        user_prompt = self._user_prompt(request_data)

        response = self.ai_orchestrator.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1200,
        )

        try:
            return self.validate_response(
                response,
                request_data["destination"],
            )
        except BudgetResponseValidationError:
            repair_prompt = (
                "The previous budget JSON failed validation. "
                "Return corrected JSON only. Keep the same destination, "
                "traveller count, duration, travel style, interests, "
                "transport preference, and preferred places. "
                "Keep the six breakdown categories exactly as requested. "
                "The six breakdown values must be non-negative whole INR "
                "numbers. Recalculate estimated_total as the exact sum "
                "of the six breakdown values. Set minimum_budget to "
                "90% of estimated_total rounded to the nearest whole INR, "
                "and maximum_budget to 110% of estimated_total rounded "
                "to the nearest whole INR."
            )

            repaired_response = self.ai_orchestrator.generate_json(
                system_prompt=system_prompt,
                user_prompt=f"{user_prompt}\n\n{repair_prompt}",
                max_tokens=1200,
            )

            return self.validate_response(
                repaired_response,
                request_data["destination"],
            )