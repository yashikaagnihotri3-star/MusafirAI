from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmergencyContact, SOSEvent
from .serializers import EmergencyContactSerializer, SOSEventSerializer

from .sms_service import SMSServiceError, send_sos_sms


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EmergencyContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(
            user=self.request.user
        )

class SOSCreateView(generics.CreateAPIView):
    serializer_class = SOSEventSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sos_event = serializer.save(user=request.user)

        contacts = EmergencyContact.objects.filter(
            user=request.user
        )

        notifications = []
        failed_notifications = []

        for contact in contacts:
            try:
                message_sid = send_sos_sms(
                    contact,
                    sos_event,
                )

                notifications.append({
                    "contact_id": contact.id,
                    "contact_name": contact.name,
                    "message_sid": message_sid,
                    "status": "SENT",
                })

            except SMSServiceError as exc:
                failed_notifications.append({
                    "contact_id": contact.id,
                    "contact_name": contact.name,
                    "status": "FAILED",
                    "error": str(exc),
                })

        response_data = self.get_serializer(
            sos_event
        ).data

        response_data["notifications"] = notifications
        response_data["failed_notifications"] = failed_notifications

        if not contacts.exists():
            response_data["notification_message"] = (
                "SOS recorded, but no emergency contacts are configured."
            )
        elif notifications:
            response_data["notification_message"] = (
                f"SOS recorded. SMS sent to "
                f"{len(notifications)} emergency contact(s)."
            )
        else:
            response_data["notification_message"] = (
                "SOS recorded, but SMS notifications could not be sent."
            )

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )

class SOSListView(generics.ListAPIView):
    serializer_class = SOSEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SOSEvent.objects.filter(user=self.request.user)


class SOSResolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            sos = SOSEvent.objects.get(
                pk=pk,
                user=request.user
            )
        except SOSEvent.DoesNotExist:
            return Response(
                {"detail": "SOS event not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if sos.status == "RESOLVED":
            return Response(
                {"detail": "SOS event is already resolved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        sos.status = "RESOLVED"
        sos.resolved_at = timezone.now()
        sos.save(update_fields=["status", "resolved_at"])

        return Response(
            SOSEventSerializer(sos).data,
            status=status.HTTP_200_OK
        )