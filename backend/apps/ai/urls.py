"""URL routes owned by the AI application."""

from django.urls import path

from .views import (
    add_itinerary_place,
    ai_health_check,
    create_itinerary,
    generate_itinerary,
    heritage_guide,
    heritage_question,
    optimize_itinerary,
    regenerate_itinerary,
    regenerate_itinerary_day,
    remove_itinerary_place,
    retrieve_itinerary,
)

urlpatterns = [
    path("health/", ai_health_check, name="ai-health-check"),
    path("itinerary/generate/", generate_itinerary, name="itinerary-generate"),
    path("itinerary/optimize/", optimize_itinerary, name="itinerary-optimize"),
    path("heritage/", heritage_guide, name="heritage-guide"),
    path("heritage/ask/", heritage_question, name="heritage-question"),
    path("itinerary/", create_itinerary, name="itinerary-create"),
    path("itinerary/<uuid:itinerary_id>/", retrieve_itinerary, name="itinerary-retrieve"),
    path("itinerary/<uuid:itinerary_id>/regenerate/", regenerate_itinerary, name="itinerary-regenerate"),
    path(
        "itinerary/<uuid:itinerary_id>/day/<int:day>/regenerate/",
        regenerate_itinerary_day,
        name="itinerary-day-regenerate",
    ),
    path(
        "itinerary/<uuid:itinerary_id>/day/<int:day>/places/",
        add_itinerary_place,
        name="itinerary-place-add",
    ),
    path(
        "itinerary/<uuid:itinerary_id>/day/<int:day>/places/<int:place_index>/",
        remove_itinerary_place,
        name="itinerary-place-remove",
    ),
]
