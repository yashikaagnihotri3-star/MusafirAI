from rest_framework import serializers

from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            "id",
            "title",
            "source",
            "destination",
            "start_date",
            "end_date",
            "budget",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_date = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None)
        )
        end_date = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None)
        )

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                "End date cannot be before start date."
            )

        if attrs.get("budget") is not None and attrs["budget"] < 0:
            raise serializers.ValidationError(
                "Budget cannot be negative."
            )

        return attrs