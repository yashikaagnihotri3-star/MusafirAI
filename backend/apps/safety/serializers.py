from rest_framework import serializers

from .models import EmergencyContact
from .models import SOSEvent


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = [
            "id",
            "name",
            "phone",
            "relationship",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Contact name cannot be empty."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must contain 10 to 15 digits."
            )

        return value




class SOSEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSEvent
        fields = [
            "id",
            "latitude",
            "longitude",
            "status",
            "triggered_at",
            "resolved_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "triggered_at",
            "resolved_at",
        ]

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError(
                "Latitude must be between -90 and 90."
            )
        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )
        return value