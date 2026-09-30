from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class EmergencyContactAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="disha",
            email="disha@example.com",
            password="testpass123",
        )

        self.client.force_authenticate(user=self.user)

        self.contact_data = {
            "name": "Disha's Mother",
            "phone": "9876543210",
            "relationship": "Mother",
            "is_primary": True,
        }

    def test_create_contact(self):
        response = self.client.post(
            "/api/safety/contacts/",
            self.contact_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["name"],
            "Disha's Mother",
        )

    def test_list_contacts(self):
        self.client.post(
            "/api/safety/contacts/",
            self.contact_data,
            format="json",
        )

        response = self.client.get(
            "/api/safety/contacts/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_update_contact(self):
        create_response = self.client.post(
            "/api/safety/contacts/",
            self.contact_data,
            format="json",
        )

        contact_id = create_response.data["id"]

        response = self.client.patch(
            f"/api/safety/contacts/{contact_id}/",
            {
                "phone": "9999999999"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["phone"],
            "9999999999",
        )

    def test_delete_contact(self):
        create_response = self.client.post(
            "/api/safety/contacts/",
            self.contact_data,
            format="json",
        )

        contact_id = create_response.data["id"]

        response = self.client.delete(
            f"/api/safety/contacts/{contact_id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_invalid_phone(self):
        invalid_data = self.contact_data.copy()
        invalid_data["phone"] = "abc123"

        response = self.client.post(
            "/api/safety/contacts/",
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_unauthenticated_user_cannot_create_contact(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/safety/contacts/",
            self.contact_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )