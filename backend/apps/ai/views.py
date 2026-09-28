"""Thin REST views for AI endpoints and stored itinerary management."""

from copy import deepcopy

from django.db import transaction
from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Itinerary
from .serializers import (
    AIHealthCheckSerializer,
    BudgetEstimateRequestSerializer,
    HeritageRequestSerializer,
    ItineraryDetailSerializer,
    ItineraryGenerateRequestSerializer,
    ItineraryPlaceSerializer,
    ItineraryOptimizationRequestSerializer,
    ItinerarySaveSerializer,
)
from .services.gemini_service import GeminiService, GeminiServiceError
from .services.itinerary_service import ItineraryService
from .services.heritage_service import HeritageService
from .services.optimization_service import OptimizationService
from .services.budget_service import BudgetService


def error_response(code, message, status, details=None):
    error = {"code": code, "message": message}
    if details is not None:
        error["details"] = details
    return Response({"success": False, "error": error}, status=status)


def itinerary_response(itinerary, status=200):
    return Response({"success": True, "itinerary": ItineraryDetailSerializer(itinerary).data}, status=status)


def get_itinerary_or_404(request, itinerary_id):
    try:
        itinerary = Itinerary.objects.get(pk=itinerary_id)
    except Itinerary.DoesNotExist as error:
        raise Http404("Itinerary not found.") from error
    if itinerary.owner_id and (
        not request.user.is_authenticated or itinerary.owner_id != request.user.id
    ):
        raise Http404("Itinerary not found.")
    return itinerary


def validated_payload(itinerary, candidate_days):
    total_cost = sum(day["estimated_day_cost"] for day in candidate_days)
    return {
        "destination": itinerary.destination,
        "days": itinerary.days,
        "total_estimated_cost": total_cost,
        "itinerary": candidate_days,
    }


def save_validated_itinerary(itinerary, candidate_days):
    validated = ItineraryService.validate_itinerary(
        validated_payload(itinerary, candidate_days), itinerary.preferences
    )
    itinerary.total_estimated_cost = validated["total_estimated_cost"]
    itinerary.itinerary = validated["itinerary"]
    itinerary.save(update_fields=["total_estimated_cost", "itinerary", "updated_at"])
    return itinerary


@api_view(["GET"])
@permission_classes([AllowAny])
def ai_health_check(request):
    """Return AI API availability without making a provider request or exposing secrets."""
    payload = {"status": "ok", "service": "ai", "gemini_configured": GeminiService.is_configured()}
    return Response(AIHealthCheckSerializer(payload).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def generate_itinerary(request):
    """Generate a validated personalized itinerary without saving it."""
    serializer = ItineraryGenerateRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("validation_error", "Invalid itinerary request.", 400, serializer.errors)
    try:
        generated = ItineraryService().generate(serializer.validated_data)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return Response({"success": True, **generated})


@api_view(["POST"])
@permission_classes([AllowAny])
def heritage_guide(request):
    """Return validated cultural and visitor guidance for a requested place."""
    serializer = HeritageRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("validation_error", "Invalid heritage request.", 400, serializer.errors)
    try:
        guide = HeritageService().generate_guide(serializer.validated_data)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return Response({"success": True, **guide})


@api_view(["POST"])
@permission_classes([AllowAny])
def heritage_question(request):
    """Return a concise, validated heritage answer for a requested place."""
    serializer = HeritageRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("validation_error", "Invalid heritage question.", 400, serializer.errors)
    try:
        answer = HeritageService().answer_question(serializer.validated_data)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return Response({"success": True, **answer})


@api_view(["POST"])
@permission_classes([AllowAny])
def optimize_itinerary(request):
    """Return a validated AI suggestion from prepared disruption and route context."""
    serializer = ItineraryOptimizationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("validation_error", "Invalid optimization request.", 400, serializer.errors)
    try:
        optimization = OptimizationService().optimize(serializer.validated_data)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return Response({"success": True, **optimization})


@api_view(["POST"])
@permission_classes([AllowAny])
def create_itinerary(request):
    """Persist a complete, previously generated itinerary after strict validation."""
    serializer = ItinerarySaveSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("validation_error", "Invalid itinerary data.", 400, serializer.errors)
    owner = request.user if request.user.is_authenticated else None
    itinerary = Itinerary.objects.create(owner=owner, **serializer.validated_data)
    return itinerary_response(itinerary, status=201)


@api_view(["GET"])
@permission_classes([AllowAny])
def retrieve_itinerary(request, itinerary_id):
    """Retrieve one stored itinerary."""
    return itinerary_response(get_itinerary_or_404(request, itinerary_id))


@api_view(["POST"])
@permission_classes([AllowAny])
def regenerate_itinerary(request, itinerary_id):
    """Replace a stored itinerary only after a newly generated complete plan validates."""
    itinerary = get_itinerary_or_404(request, itinerary_id)
    try:
        generated = ItineraryService().generate(itinerary.preferences)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    with transaction.atomic():
        itinerary.itinerary = generated["itinerary"]
        itinerary.total_estimated_cost = generated["total_estimated_cost"]
        itinerary.save(update_fields=["itinerary", "total_estimated_cost", "updated_at"])
    return itinerary_response(itinerary)


@api_view(["POST"])
@permission_classes([AllowAny])
def regenerate_itinerary_day(request, itinerary_id, day):
    """Replace one day and validate the complete resulting itinerary before saving."""
    itinerary = get_itinerary_or_404(request, itinerary_id)
    if not 1 <= day <= itinerary.days:
        return error_response("invalid_day", "The requested day is not part of this itinerary.", 400)
    current_days = deepcopy(itinerary.itinerary)
    current_day_cost = current_days[day - 1]["estimated_day_cost"]
    maximum_day_cost = itinerary.budget - (itinerary.total_estimated_cost - current_day_cost)
    try:
        replacement = ItineraryService().regenerate_day(itinerary.preferences, day, maximum_day_cost)
        current_days[day - 1] = replacement
        with transaction.atomic():
            save_validated_itinerary(itinerary, current_days)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return itinerary_response(itinerary)


@api_view(["POST"])
@permission_classes([AllowAny])
def add_itinerary_place(request, itinerary_id, day):
    """Add one manually supplied, validated place and recalculate all relevant costs."""
    itinerary = get_itinerary_or_404(request, itinerary_id)
    if not 1 <= day <= itinerary.days:
        return error_response("invalid_day", "The requested day is not part of this itinerary.", 400)
    serializer = ItineraryPlaceSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("validation_error", "Invalid place data.", 400, serializer.errors)
    candidate_days = deepcopy(itinerary.itinerary)
    candidate_days[day - 1]["places"].append(serializer.validated_data)
    candidate_days[day - 1]["estimated_day_cost"] += serializer.validated_data["estimated_cost"]
    try:
        with transaction.atomic():
            save_validated_itinerary(itinerary, candidate_days)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return itinerary_response(itinerary)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_itinerary_place(request, itinerary_id, day, place_index):
    """Remove a place by its zero-based index and recalculate the stored costs."""
    itinerary = get_itinerary_or_404(request, itinerary_id)
    if not 1 <= day <= itinerary.days:
        return error_response("invalid_day", "The requested day is not part of this itinerary.", 400)
    candidate_days = deepcopy(itinerary.itinerary)
    places = candidate_days[day - 1]["places"]
    if not 0 <= place_index < len(places):
        return error_response("invalid_place", "The requested place is not part of this itinerary day.", 400)
    removed_place = places.pop(place_index)
    candidate_days[day - 1]["estimated_day_cost"] -= removed_place["estimated_cost"]
    try:
        with transaction.atomic():
            save_validated_itinerary(itinerary, candidate_days)
    except GeminiServiceError as error:
        return error_response(error.code, error.message, error.status_code)
    return itinerary_response(itinerary)

@api_view(["POST"])
@permission_classes([AllowAny])
def estimate_budget(request):
    """Return a validated AI-powered travel budget estimate."""
    serializer = BudgetEstimateRequestSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            "validation_error",
            "Invalid budget estimate request.",
            400,
            serializer.errors,
        )

    try:
        estimate = BudgetService().estimate(serializer.validated_data)
    except GeminiServiceError as error:
        return error_response(
            error.code,
            error.message,
            error.status_code,
        )

    return Response({"success": True, **estimate})
