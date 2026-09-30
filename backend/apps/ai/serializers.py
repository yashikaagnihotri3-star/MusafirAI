"""Serializers shared by AI API endpoints."""

from rest_framework import serializers

from .models import Itinerary
from .services.itinerary_service import ItineraryResponseValidationError, ItineraryService


class AIHealthCheckSerializer(serializers.Serializer):
    status = serializers.CharField()
    service = serializers.CharField()
    gemini_configured = serializers.BooleanField()


class ItineraryGenerateRequestSerializer(serializers.Serializer):
    """Validate the user preferences accepted by the itinerary generator."""

    INTEREST_CHOICES = (
        "adventure", "culture", "food", "heritage", "nature", "photography", "shopping",
        "spirituality", "wellness", "wildlife",
    )
    TRAVEL_STYLE_CHOICES = ("solo", "couple", "family", "friends", "group")
    TRAVEL_PACE_CHOICES = ("relaxed", "moderate", "fast")

    destination = serializers.CharField(min_length=2, max_length=100, trim_whitespace=True)
    preferred_places = serializers.ListField(
        child=serializers.CharField(
            min_length=1,
            max_length=150,
            trim_whitespace=True,
        ),
        required=False,
        default=list,
        max_length=30,
        allow_empty=True,
    )
    days = serializers.IntegerField(min_value=1, max_value=14)
    
    def validate_preferred_places(self, value):
        cleaned = []
        seen = set()

        for place in value:
            place = place.strip()
            key = place.casefold()

            if key not in seen:
                seen.add(key)
                cleaned.append(place)

        return cleaned
    
    budget = serializers.IntegerField(min_value=1, max_value=10_000_000)
    interests = serializers.ListField(
        child=serializers.ChoiceField(choices=INTEREST_CHOICES), min_length=1, max_length=5
    )
    travel_style = serializers.ChoiceField(choices=TRAVEL_STYLE_CHOICES, default="solo")
    travel_pace = serializers.ChoiceField(choices=TRAVEL_PACE_CHOICES, default="moderate")

    def validate_destination(self, value):
        if not any(character.isalpha() for character in value):
            raise serializers.ValidationError("Destination must include letters.")
        return value

    def validate_interests(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Interests must not contain duplicates.")
        return value


class ItinerarySaveSerializer(ItineraryGenerateRequestSerializer):
    """Validate an itinerary before it is persisted or replaced."""

    total_estimated_cost = serializers.IntegerField(min_value=0)
    itinerary = serializers.ListField(min_length=1)

    def validate(self, attrs):
        preferences = {
            key: attrs[key]
            for key in ("destination", "days", "budget", "interests", "travel_style", "travel_pace", "preferred_places")
        }
        response = {
            "destination": attrs["destination"],
            "days": attrs["days"],
            "total_estimated_cost": attrs["total_estimated_cost"],
            "itinerary": attrs["itinerary"],
        }
        try:
            validated = ItineraryService.validate_itinerary(response, preferences)
        except ItineraryResponseValidationError as error:
            raise serializers.ValidationError({"itinerary": error.message}) from error
        attrs.update(validated)
        return attrs


class ItineraryPlaceSerializer(serializers.Serializer):
    """Validate a manually added place using the same itinerary contract as AI output."""

    name = serializers.CharField(min_length=1, max_length=150, trim_whitespace=True)
    time = serializers.CharField(min_length=5, max_length=5)
    duration_minutes = serializers.IntegerField(min_value=1, max_value=1440)
    estimated_cost = serializers.IntegerField(min_value=0)
    reason = serializers.CharField(min_length=1, max_length=500, trim_whitespace=True)

    def validate(self, attrs):
        try:
            return ItineraryService.validate_place(attrs)
        except ItineraryResponseValidationError as error:
            raise serializers.ValidationError({"place": error.message}) from error


class ItineraryDetailSerializer(serializers.ModelSerializer):
    """Stable frontend representation of a stored itinerary."""

    class Meta:
        model = Itinerary
        fields = (
            "id",
            "destination",
            "days",
            "budget",
            "interests",
            "travel_style",
            "travel_pace",
            "preferred_places",
            "total_estimated_cost",
            "itinerary",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class HeritageRequestSerializer(serializers.Serializer):
    """Validate concise place-specific heritage requests."""

    place = serializers.CharField(min_length=2, max_length=150, trim_whitespace=True)
    question = serializers.CharField(min_length=2, max_length=500, trim_whitespace=True)

    def validate_place(self, value):
        if not any(character.isalpha() for character in value):
            raise serializers.ValidationError("Place must include letters.")
        return value


class ItineraryOptimizationRequestSerializer(serializers.Serializer):
    """Validate externally prepared context for AI-only itinerary optimization."""

    current_itinerary = serializers.DictField()
    visited_places = serializers.ListField(required=False, default=list)
    remaining_places = serializers.ListField(min_length=1)
    current_location = serializers.DictField(required=False, default=dict)
    available_time_minutes = serializers.IntegerField(min_value=0, max_value=10_080)
    reason = serializers.CharField(min_length=2, max_length=500, trim_whitespace=True)
    weather_context = serializers.DictField(required=False, default=dict)
    remaining_budget = serializers.IntegerField(min_value=0, max_value=10_000_000)
    preferences = serializers.DictField(required=False, default=dict)

    def validate(self, attrs):
        for field in ("visited_places", "remaining_places"):
            if not self._valid_places(attrs[field]):
                raise serializers.ValidationError(
                    {field: "Each place must be a name string or an object with a non-empty name."}
                )
        return attrs

    @staticmethod
    def _valid_places(places):
        return all(
            (isinstance(place, str) and place.strip() and len(place.strip()) <= 150)
            or (
                isinstance(place, dict)
                and isinstance(place.get("name"), str)
                and place["name"].strip()
                and len(place["name"].strip()) <= 150
            )
            for place in places
        )
class BudgetEstimateRequestSerializer(serializers.Serializer):
    """Validate travel details for AI-powered budget estimation."""

    destination = serializers.CharField(
        min_length=2,
        max_length=100,
        trim_whitespace=True,
    )
    days = serializers.IntegerField(min_value=1, max_value=30)
    travellers = serializers.IntegerField(min_value=1, max_value=50)
    travel_style = serializers.ChoiceField(
        choices=("budget", "moderate", "luxury"),
    )
    travel_pace = serializers.ChoiceField(
        choices=("relaxed", "comfortable", "packed"),
    )
    interests = serializers.ListField(
        child=serializers.CharField(
            min_length=1,
            max_length=50,
            trim_whitespace=True,
        ),
        required=False,
        default=list,
        allow_empty=True,
    )
    transport_preference = serializers.CharField(
        min_length=2,
        max_length=50,
        trim_whitespace=True,
        required=False,
        default="not specified",
    )

    def validate_destination(self, value):
        if not any(character.isalpha() for character in value):
            raise serializers.ValidationError(
                "Destination must include letters."
            )
        return value