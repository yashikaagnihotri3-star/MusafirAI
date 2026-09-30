from django.test import TestCase

# Create your tests here.
from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class TripAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="disha",
            email="disha@example.com",
            password="testpass123"
        )

        self.client.force_authenticate(user=self.user)

        self.trip_data = {
            "title": "Dehradun Trip",
            "source": "Bareilly",
            "destination": "Dehradun",
            "start_date": "2026-10-07",
            "end_date": "2026-10-10",
            "budget": "15000.00",
        }

    def test_create_trip(self):
        response = self.client.post(
            "/api/trips/",
            self.trip_data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            response.data["title"],
            "Dehradun Trip"
        )

        self.assertEqual(
            response.data["budget"],
            "15000.00"
        )

    def test_list_trips(self):
        self.client.post(
            "/api/trips/",
            self.trip_data,
            format="json"
        )

        response = self.client.get("/api/trips/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data), 1)

    def test_update_trip(self):
        create_response = self.client.post(
            "/api/trips/",
            self.trip_data,
            format="json"
        )

        trip_id = create_response.data["id"]

        response = self.client.patch(
            f"/api/trips/{trip_id}/",
            {
                "budget": "20000.00"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["budget"],
            "20000.00"
        )

    def test_delete_trip(self):
        create_response = self.client.post(
            "/api/trips/",
            self.trip_data,
            format="json"
        )

        trip_id = create_response.data["id"]

        response = self.client.delete(
            f"/api/trips/{trip_id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

    def test_invalid_dates(self):
        invalid_trip = self.trip_data.copy()

        invalid_trip["start_date"] = "2026-10-10"
        invalid_trip["end_date"] = "2026-10-07"

        response = self.client.post(
            "/api/trips/",
            invalid_trip,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_negative_budget(self):
        invalid_trip = self.trip_data.copy()
        invalid_trip["budget"] = "-5000.00"

        response = self.client.post(
            "/api/trips/",
            invalid_trip,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_unauthenticated_user_cannot_create_trip(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/trips/",
            self.trip_data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )