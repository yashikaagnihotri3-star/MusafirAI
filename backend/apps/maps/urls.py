from django.urls import path

from .views import (
    DistanceAPIView,
    RoutePreviewAPIView,
    SafetyPointsAPIView,
)


urlpatterns = [
    path(
        "distance/",
        DistanceAPIView.as_view(),
        name="distance",
    ),
    path(
        "route-preview/",
        RoutePreviewAPIView.as_view(),
        name="route-preview",
    ),
    path(
        "safety-points/",
        SafetyPointsAPIView.as_view(),
        name="safety-points",
    ),
]