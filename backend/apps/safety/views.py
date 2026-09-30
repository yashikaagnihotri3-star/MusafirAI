from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmergencyContact, SOSEvent
from .serializers import EmergencyContactSerializer, SOSEventSerializer


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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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