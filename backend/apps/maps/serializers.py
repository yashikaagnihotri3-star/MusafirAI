from rest_framework import serializers


class CoordinateSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()

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


class DistanceRequestSerializer(serializers.Serializer):
    origin = CoordinateSerializer()
    destination = CoordinateSerializer()

    

class SafetyPointsRequestSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    radius_km = serializers.FloatField(
        required=False,
        default=5.0
    )
    categories = serializers.ListField(
        child=serializers.ChoiceField(
            choices=[
                "POLICE",
                "HOSPITAL",
                "EMERGENCY",
            ]
        ),
        required=False,
        default=["POLICE", "HOSPITAL", "EMERGENCY"],
    )

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

    def validate_radius_km(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Radius must be greater than 0."
            )

        if value > 50:
            raise serializers.ValidationError(
                "Radius cannot exceed 50 km."
            )

        return value