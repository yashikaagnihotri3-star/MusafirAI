from django.urls import path

from .views import (
    EmergencyContactDetailView,
    EmergencyContactListCreateView,
    SOSCreateView,
    SOSListView,
    SOSResolveView,
)


urlpatterns = [
    path(
        "contacts/",
        EmergencyContactListCreateView.as_view(),
        name="emergency-contact-list-create",
    ),
    path(
        "contacts/<int:pk>/",
        EmergencyContactDetailView.as_view(),
        name="emergency-contact-detail",
    ),
     # SOS
    path(
        "sos/",
        SOSCreateView.as_view(),
        name="sos-create",
    ),
    path(
        "sos/history/",
        SOSListView.as_view(),
        name="sos-list",
    ),
    path(
        "sos/<int:pk>/resolve/",
        SOSResolveView.as_view(),
        name="sos-resolve",
    ),
]