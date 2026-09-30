"""Persistence models owned by the AI application."""

import uuid

from django.conf import settings
from django.db import models


class Itinerary(models.Model):
    """A validated AI itinerary and the preferences used to generate it."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_itineraries",
    )
    destination = models.CharField(max_length=100)
    days = models.PositiveSmallIntegerField()
    budget = models.PositiveIntegerField()
    interests = models.JSONField(default=list)
    travel_style = models.CharField(max_length=20)
    travel_pace = models.CharField(max_length=20)
    preferred_places = models.JSONField(default=list, blank=True)
    total_estimated_cost = models.PositiveIntegerField()
    itinerary = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self) -> str:
        return f"{self.destination} ({self.days} days)"

    @property
    def preferences(self) -> dict:
        return {
            "destination": self.destination,
            "days": self.days,
            "budget": self.budget,
            "interests": self.interests,
            "travel_style": self.travel_style,
            "travel_pace": self.travel_pace,
            "preferred_places": self.preferred_places,
        }
