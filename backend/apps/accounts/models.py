from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.username

class TravelPreference(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    budget = models.CharField(
        max_length=50,
        blank=True
    )

    travel_style = models.CharField(
        max_length=100,
        blank=True
    )

    food_preference = models.CharField(
        max_length=100,
        blank=True
    )

    accommodation_preference = models.CharField(
        max_length=100,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username}'s preferences"