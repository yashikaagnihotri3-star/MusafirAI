from types import SimpleNamespace
from unittest.mock import patch

from django.test import TestCase, override_settings
from google.genai import errors
from rest_framework.test import APIClient

from .services.gemini_service import GeminiService, GeminiServiceError
from .services.itinerary_service import ItineraryResponseValidationError, ItineraryService
from .services.heritage_service import HeritageResponseValidationError, HeritageService
from .services.optimization_service import OptimizationResponseValidationError, OptimizationService
from .models import Itinerary


class AIHealthCheckTests(TestCase):
    def test_health_check_does_not_expose_provider_secret(self):
        response = APIClient().get("/api/ai/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
        self.assertIn("gemini_configured", response.data)
        self.assertNotIn("GEMINI_API_KEY", response.data)

    @override_settings(GEMINI_API_KEY="test-key-not-used")
    def test_health_check_reports_gemini_configuration_without_exposing_key(self):
        response = APIClient().get("/api/ai/health/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["gemini_configured"])
        self.assertNotIn("test-key-not-used", str(response.data))


class GeminiServiceTests(TestCase):
    def test_returns_text_content_from_provider_response(self):
        provider = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=lambda **kwargs: SimpleNamespace(text="Generated result")
            )
        )

        result = GeminiService(client=provider).generate_text(
            system_prompt="You are helpful.", user_prompt="Hello"
        )

        self.assertEqual(result, "Generated result")

    def test_rejects_empty_provider_response(self):
        provider = SimpleNamespace(models=SimpleNamespace(generate_content=lambda **kwargs: SimpleNamespace(text="")))

        with self.assertRaisesRegex(GeminiServiceError, "empty response"):
            GeminiService(client=provider).generate_text(system_prompt="System", user_prompt="User")

    def test_rejects_malformed_json(self):
        provider = SimpleNamespace(models=SimpleNamespace(generate_content=lambda **kwargs: SimpleNamespace(text="not json")))

        with self.assertRaisesRegex(GeminiServiceError, "invalid response"):
            GeminiService(client=provider).generate_json(system_prompt="System", user_prompt="User")

    @override_settings(GEMINI_API_KEY="")
    def test_requires_provider_key_when_no_client_is_injected(self):
        with self.assertRaisesRegex(GeminiServiceError, "not configured"):
            GeminiService()

    def test_maps_gemini_api_failure_to_safe_error(self):
        provider = SimpleNamespace(
            models=SimpleNamespace(
                generate_content=lambda **kwargs: (_ for _ in ()).throw(
                    errors.ClientError(429, {"message": "rate limited"}, None)
                )
            )
        )

        with self.assertRaisesRegex(GeminiServiceError, "busy") as context:
            GeminiService(client=provider).generate_text(system_prompt="System", user_prompt="User")

        self.assertEqual(context.exception.code, "provider_rate_limited")
        self.assertEqual(context.exception.status_code, 429)


class ItineraryGenerateTests(TestCase):
    endpoint = "/api/ai/itinerary/generate/"

    def setUp(self):
        self.client = APIClient()

    @staticmethod
    def request_payload(**overrides):
        payload = {
            "destination": "Dehradun",
            "days": 1,
            "budget": 5000,
            "interests": ["nature", "heritage"],
            "travel_style": "solo",
            "travel_pace": "moderate",
        }
        payload.update(overrides)
        return payload

    @staticmethod
    def one_day_itinerary(cost=500):
        return {
            "destination": "Dehradun",
            "days": 1,
            "total_estimated_cost": cost,
            "itinerary": [
                {
                    "day": 1,
                    "places": [
                        {
                            "name": "Robber's Cave",
                            "time": "10:00",
                            "duration_minutes": 120,
                            "estimated_cost": cost,
                            "reason": "Matches the requested nature interest.",
                        }
                    ],
                    "estimated_day_cost": cost,
                }
            ],
        }

    @staticmethod
    def three_day_itinerary():
        itinerary = []
        for day in range(1, 4):
            itinerary.append(
                {
                    "day": day,
                    "places": [
                        {
                            "name": f"Place {day}",
                            "time": "10:00",
                            "duration_minutes": 120,
                            "estimated_cost": 1500,
                            "reason": "Fits the selected interests.",
                        }
                    ],
                    "estimated_day_cost": 1500,
                }
            )
        return {
            "destination": "Dehradun",
            "days": 3,
            "total_estimated_cost": 4500,
            "itinerary": itinerary,
        }

    def post_with_itinerary(self, payload, itinerary):
        with patch("apps.ai.views.ItineraryService") as service_class:
            service_class.return_value.generate.return_value = itinerary
            return self.client.post(self.endpoint, payload, format="json")

    def test_generates_valid_one_day_trip(self):
        response = self.post_with_itinerary(self.request_payload(), self.one_day_itinerary())

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["days"], 1)

    def test_generates_valid_three_day_trip(self):
        response = self.post_with_itinerary(
            self.request_payload(days=3), self.three_day_itinerary()
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["itinerary"]), 3)
        self.assertEqual(response.data["total_estimated_cost"], 4500)

    def test_accepts_low_budget_trip_when_provider_result_is_within_budget(self):
        response = self.post_with_itinerary(
            self.request_payload(budget=500), self.one_day_itinerary(cost=500)
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_estimated_cost"], 500)

    def test_accepts_different_valid_interests(self):
        response = self.post_with_itinerary(
            self.request_payload(interests=["food", "culture"]), self.one_day_itinerary()
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_rejects_missing_destination(self):
        payload = self.request_payload()
        payload.pop("destination")

        response = self.client.post(self.endpoint, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "validation_error")
        self.assertIn("destination", response.data["error"]["details"])

    def test_rejects_invalid_days(self):
        response = self.client.post(self.endpoint, self.request_payload(days=0), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("days", response.data["error"]["details"])

    def test_rejects_invalid_budget(self):
        response = self.client.post(self.endpoint, self.request_payload(budget=0), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("budget", response.data["error"]["details"])

    def test_rejects_malformed_ai_itinerary(self):
        fake_gemini = SimpleNamespace(generate_json=lambda **kwargs: {"destination": "Dehradun"})
        service = ItineraryService(gemini_service=fake_gemini)

        with self.assertRaises(ItineraryResponseValidationError):
            service.generate(self.request_payload())

    def test_returns_controlled_error_when_gemini_fails(self):
        provider_error = GeminiServiceError("provider_timeout", "The AI provider timed out. Please try again.")
        with patch("apps.ai.views.ItineraryService") as service_class:
            service_class.return_value.generate.side_effect = provider_error
            response = self.client.post(self.endpoint, self.request_payload(), format="json")

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["error"]["code"], "provider_timeout")


class ItineraryPersistenceTests(TestCase):
    endpoint = "/api/ai/itinerary/"

    def setUp(self):
        self.client = APIClient()
        self.preferences = {
            "destination": "Dehradun",
            "days": 1,
            "budget": 5000,
            "interests": ["nature", "heritage"],
            "travel_style": "solo",
            "travel_pace": "moderate",
        }

    def itinerary_payload(self, cost=500, places=None):
        if places is None:
            places = [
                {
                    "name": "Robber's Cave",
                    "time": "10:00",
                    "duration_minutes": 120,
                    "estimated_cost": cost,
                    "reason": "Matches the selected interests.",
                }
            ]
        return {
            **self.preferences,
            "total_estimated_cost": sum(place["estimated_cost"] for place in places),
            "itinerary": [{"day": 1, "places": places, "estimated_day_cost": sum(place["estimated_cost"] for place in places)}],
        }

    def create_saved_itinerary(self, **overrides):
        payload = self.itinerary_payload()
        payload.update(overrides)
        return Itinerary.objects.create(**payload)

    def test_saves_validated_itinerary(self):
        response = self.client.post(self.endpoint, self.itinerary_payload(), format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertEqual(Itinerary.objects.count(), 1)
        self.assertEqual(response.data["itinerary"]["destination"], "Dehradun")

    def test_retrieves_saved_itinerary(self):
        itinerary = self.create_saved_itinerary()

        response = self.client.get(f"{self.endpoint}{itinerary.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["itinerary"]["id"], str(itinerary.id))

    def test_regenerates_complete_itinerary(self):
        itinerary = self.create_saved_itinerary()
        regenerated = self.itinerary_payload(cost=750)
        generated_response = {key: regenerated[key] for key in ("destination", "days", "total_estimated_cost", "itinerary")}
        with patch("apps.ai.views.ItineraryService") as service_class:
            service_class.return_value.generate.return_value = generated_response
            response = self.client.post(f"{self.endpoint}{itinerary.id}/regenerate/", format="json")

        itinerary.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(itinerary.total_estimated_cost, 750)

    def test_regenerates_one_day(self):
        itinerary = self.create_saved_itinerary()
        replacement_day = {
            "day": 1,
            "places": [{"name": "Forest Research Institute", "time": "09:30", "duration_minutes": 180, "estimated_cost": 600, "reason": "A suitable alternative."}],
            "estimated_day_cost": 600,
        }
        with patch("apps.ai.views.ItineraryService") as service_class:
            service_class.return_value.regenerate_day.return_value = replacement_day
            service_class.validate_itinerary.side_effect = ItineraryService.validate_itinerary
            response = self.client.post(f"{self.endpoint}{itinerary.id}/day/1/regenerate/", format="json")

        itinerary.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(itinerary.itinerary[0]["places"][0]["name"], "Forest Research Institute")
        self.assertEqual(itinerary.total_estimated_cost, 600)

    def test_adds_place_and_recalculates_cost(self):
        itinerary = self.create_saved_itinerary()
        place = {"name": "Clock Tower", "time": "14:00", "duration_minutes": 45, "estimated_cost": 200, "reason": "A nearby landmark."}

        response = self.client.post(f"{self.endpoint}{itinerary.id}/day/1/places/", place, format="json")

        itinerary.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(itinerary.itinerary[0]["places"]), 2)
        self.assertEqual(itinerary.total_estimated_cost, 700)

    def test_removes_place_and_recalculates_cost(self):
        places = [
            {"name": "Robber's Cave", "time": "10:00", "duration_minutes": 120, "estimated_cost": 500, "reason": "Nature interest."},
            {"name": "Clock Tower", "time": "14:00", "duration_minutes": 45, "estimated_cost": 200, "reason": "Heritage interest."},
        ]
        itinerary = self.create_saved_itinerary(**self.itinerary_payload(places=places))

        response = self.client.delete(f"{self.endpoint}{itinerary.id}/day/1/places/0/")

        itinerary.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(itinerary.total_estimated_cost, 200)
        self.assertEqual(itinerary.itinerary[0]["places"][0]["name"], "Clock Tower")

    def test_returns_not_found_for_invalid_itinerary_id(self):
        response = self.client.get("/api/ai/itinerary/00000000-0000-0000-0000-000000000000/")

        self.assertEqual(response.status_code, 404)

    def test_rejects_invalid_day(self):
        itinerary = self.create_saved_itinerary()

        response = self.client.post(f"{self.endpoint}{itinerary.id}/day/2/regenerate/", format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "invalid_day")

    def test_rejects_invalid_itinerary_data_without_saving(self):
        invalid_payload = self.itinerary_payload()
        invalid_payload["total_estimated_cost"] = 999

        response = self.client.post(self.endpoint, invalid_payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Itinerary.objects.count(), 0)

    def test_returns_controlled_error_for_ai_failure(self):
        itinerary = self.create_saved_itinerary()
        error = GeminiServiceError("provider_timeout", "The AI provider timed out. Please try again.")
        with patch("apps.ai.views.ItineraryService") as service_class:
            service_class.return_value.generate.side_effect = error
            response = self.client.post(f"{self.endpoint}{itinerary.id}/regenerate/", format="json")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "provider_timeout")

    def test_returns_controlled_error_for_malformed_ai_response(self):
        itinerary = self.create_saved_itinerary()
        with patch("apps.ai.views.ItineraryService") as service_class:
            service_class.return_value.generate.side_effect = ItineraryResponseValidationError()
            response = self.client.post(f"{self.endpoint}{itinerary.id}/regenerate/", format="json")

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data["error"]["code"], "invalid_ai_response")


class HeritageAPITests(TestCase):
    guide_endpoint = "/api/ai/heritage/"
    ask_endpoint = "/api/ai/heritage/ask/"

    def setUp(self):
        self.client = APIClient()
        self.request_data = {"place": "Robber's Cave", "question": "Tell me about this place"}

    @staticmethod
    def guide_response(known=True):
        return {
            "place": "Robber's Cave",
            "known": known,
            "history": "Local accounts associate the cave with historic bandit lore." if known else "Reliable heritage information could not be confirmed.",
            "architecture": "A natural river cave formation." if known else "",
            "cultural_significance": "It is a popular local natural attraction." if known else "",
            "important_facts": ["It is also known locally as Gucchu Pani."] if known else [],
            "local_stories": ["Local tradition connects it with hiding bandits."] if known else [],
            "traditions": [],
            "local_tips": ["Wear footwear with grip near wet areas."] if known else [],
            "dos": ["Respect posted safety guidance."] if known else [],
            "donts": ["Do not leave litter."] if known else [],
        }

    def test_returns_valid_heritage_guide(self):
        with patch("apps.ai.views.HeritageService") as service_class:
            service_class.return_value.generate_guide.return_value = self.guide_response()
            response = self.client.post(self.guide_endpoint, self.request_data, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertTrue(response.data["known"])
        self.assertIn("important_facts", response.data)

    def test_returns_historical_question_answer(self):
        request_data = {"place": "Robber's Cave", "question": "Why is this place historically important?"}
        answer = {"place": "Robber's Cave", "question": request_data["question"], "known": True, "answer": "Its historic importance is mostly expressed through local bandit lore rather than a confirmed major monument record."}
        with patch("apps.ai.views.HeritageService") as service_class:
            service_class.return_value.answer_question.return_value = answer
            response = self.client.post(self.ask_endpoint, request_data, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["question"], request_data["question"])

    def test_returns_cultural_question_answer(self):
        request_data = {"place": "Robber's Cave", "question": "What cultural traditions are associated with it?"}
        answer = {"place": "Robber's Cave", "question": request_data["question"], "known": True, "answer": "It is primarily a local recreation site; any stories about bandits should be treated as local tradition."}
        with patch("apps.ai.views.HeritageService") as service_class:
            service_class.return_value.answer_question.return_value = answer
            response = self.client.post(self.ask_endpoint, request_data, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_handles_unknown_place_without_claiming_facts(self):
        unknown = {"place": "Unknown Place", "question": "Tell me about this place"}
        unknown_response = self.guide_response(known=False)
        unknown_response["place"] = "Unknown Place"
        with patch("apps.ai.views.HeritageService") as service_class:
            service_class.return_value.generate_guide.return_value = unknown_response
            response = self.client.post(self.guide_endpoint, unknown, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["known"])

    def test_rejects_empty_place_and_question(self):
        response = self.client.post(self.guide_endpoint, {"place": "", "question": ""}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("place", response.data["error"]["details"])
        self.assertIn("question", response.data["error"]["details"])

    def test_rejects_very_long_question(self):
        response = self.client.post(
            self.ask_endpoint,
            {"place": "Robber's Cave", "question": "a" * 501},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("question", response.data["error"]["details"])

    def test_rejects_malformed_heritage_response(self):
        fake_gemini = SimpleNamespace(generate_json=lambda **kwargs: {"place": "Robber's Cave"})
        with self.assertRaises(HeritageResponseValidationError):
            HeritageService(gemini_service=fake_gemini).generate_guide(self.request_data)

    def test_returns_controlled_error_for_ai_failure(self):
        error = GeminiServiceError("provider_timeout", "The AI provider timed out. Please try again.")
        with patch("apps.ai.views.HeritageService") as service_class:
            service_class.return_value.answer_question.side_effect = error
            response = self.client.post(self.ask_endpoint, self.request_data, format="json")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "provider_timeout")


class ItineraryOptimizationTests(TestCase):
    endpoint = "/api/ai/itinerary/optimize/"

    def setUp(self):
        self.client = APIClient()

    @staticmethod
    def context(**overrides):
        payload = {
            "current_itinerary": {"places": ["Museum", "Waterfall", "Market"]},
            "visited_places": ["Museum"],
            "remaining_places": ["Waterfall", "Market"],
            "current_location": {"name": "City Centre"},
            "available_time_minutes": 300,
            "reason": "Weather disruption",
            "weather_context": {"condition": "rain"},
            "remaining_budget": 2000,
            "preferences": {"interests": ["nature"]},
        }
        payload.update(overrides)
        return payload

    @staticmethod
    def optimized_result(places=None, cost=300, time_minutes=180):
        places = places or ["Market"]
        return {
            "updated_itinerary": {
                "places": places,
                "estimated_time_minutes": time_minutes,
                "estimated_cost": cost,
            },
            "removed_places": ["Waterfall"],
            "added_places": [],
            "reason": "The waterfall was skipped using the supplied disruption context.",
            "estimated_cost": cost,
        }

    def post_with_result(self, context, result):
        with patch("apps.ai.views.OptimizationService") as service_class:
            service_class.return_value.optimize.return_value = result
            return self.client.post(self.endpoint, context, format="json")

    def test_handles_unavailable_place(self):
        response = self.post_with_result(self.context(reason="Waterfall unavailable"), self.optimized_result())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["updated_itinerary"]["places"], ["Market"])
        self.assertIn("Waterfall", response.data["removed_places"])

    def test_handles_weather_disruption(self):
        response = self.post_with_result(self.context(), self.optimized_result())

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_handles_user_delay(self):
        response = self.post_with_result(
            self.context(reason="User delay", available_time_minutes=60),
            self.optimized_result(time_minutes=45),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["updated_itinerary"]["estimated_time_minutes"], 45)

    def test_does_not_return_already_visited_place(self):
        malformed = self.optimized_result(places=["Museum"])
        fake_gemini = SimpleNamespace(generate_json=lambda **kwargs: malformed)

        with self.assertRaises(OptimizationResponseValidationError):
            OptimizationService(gemini_service=fake_gemini).optimize(self.context())

    def test_handles_insufficient_time(self):
        malformed = self.optimized_result(time_minutes=301)
        fake_gemini = SimpleNamespace(generate_json=lambda **kwargs: malformed)

        with self.assertRaises(OptimizationResponseValidationError):
            OptimizationService(gemini_service=fake_gemini).optimize(self.context())

    def test_handles_changed_budget(self):
        response = self.post_with_result(
            self.context(remaining_budget=200), self.optimized_result(cost=200)
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estimated_cost"], 200)

    def test_rejects_invalid_optimization_request(self):
        response = self.client.post(self.endpoint, self.context(remaining_places=[]), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "validation_error")

    def test_rejects_malformed_optimization_response(self):
        fake_gemini = SimpleNamespace(generate_json=lambda **kwargs: {"updated_itinerary": {}})

        with self.assertRaises(OptimizationResponseValidationError):
            OptimizationService(gemini_service=fake_gemini).optimize(self.context())

    def test_returns_controlled_error_for_ai_failure(self):
        error = GeminiServiceError("provider_timeout", "The AI provider timed out. Please try again.")
        with patch("apps.ai.views.OptimizationService") as service_class:
            service_class.return_value.optimize.side_effect = error
            response = self.client.post(self.endpoint, self.context(), format="json")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "provider_timeout")
class AIOrchestratorTests(TestCase):
    """Tests for primary/fallback AI orchestration."""
    @override_settings(FALLBACK_AI_ENABLED=True)
    def test_uses_fallback_when_gemini_fails(self):
        from unittest.mock import Mock

        from .services.ai_orchestrator import AIOrchestrator

        gemini = Mock()
        gemini.generate_text.side_effect = GeminiServiceError(
            "provider_rate_limited",
            "The AI provider is busy.",
            429,
        )

        fallback = Mock()
        fallback.generate_text.return_value = "Fallback response"

        orchestrator = AIOrchestrator(
            gemini_service=gemini,
            fallback_provider=fallback,
        )

        result = orchestrator.generate_text(
            system_prompt="system",
            user_prompt="user",
        )

        self.assertEqual(result, "Fallback response")
        fallback.generate_text.assert_called_once()
class AIOrchestratorTests(TestCase):
    """Tests for primary/fallback AI orchestration."""

    @override_settings(FALLBACK_AI_ENABLED=True)
    def test_uses_fallback_when_gemini_fails(self):
        from unittest.mock import Mock

        from .services.ai_orchestrator import AIOrchestrator

        gemini = Mock()
        gemini.generate_text.side_effect = GeminiServiceError(
            "provider_rate_limited",
            "The AI provider is busy.",
            429,
        )

        fallback = Mock()
        fallback.generate_text.return_value = "Fallback response"

        orchestrator = AIOrchestrator(
            gemini_service=gemini,
            fallback_provider=fallback,
        )

        result = orchestrator.generate_text(
            system_prompt="system",
            user_prompt="user",
        )

        self.assertEqual(result, "Fallback response")
        fallback.generate_text.assert_called_once()

    @override_settings(FALLBACK_AI_ENABLED=False)
    def test_does_not_use_fallback_when_disabled(self):
        from unittest.mock import Mock

        from .services.ai_orchestrator import AIOrchestrator

        gemini = Mock()
        error = GeminiServiceError(
            "provider_rate_limited",
            "The AI provider is busy.",
            429,
        )
        gemini.generate_text.side_effect = error

        fallback = Mock()
        fallback.generate_text.return_value = "Fallback response"

        orchestrator = AIOrchestrator(
            gemini_service=gemini,
            fallback_provider=fallback,
        )

        with self.assertRaises(GeminiServiceError) as context:
            orchestrator.generate_text(
                system_prompt="system",
                user_prompt="user",
            )

        self.assertEqual(context.exception.code, "provider_rate_limited")
        fallback.generate_text.assert_not_called()