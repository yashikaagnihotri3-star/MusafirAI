from django.conf import settings
from django.db import models


class Trip(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trips"
    )

    title = models.CharField(max_length=200)

    source = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)

    start_date = models.DateField()
    end_date = models.DateField()

    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.destination}"