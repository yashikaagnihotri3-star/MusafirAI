from rest_framework import serializers
from .models import User
from .models import TravelPreference


class SignupSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'phone'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already registered."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', '')
        )

        return user

class TravelPreferenceSerializer(serializers.ModelSerializer):

    class Meta:
        model = TravelPreference
        fields = [
            'budget',
            'travel_style',
            'food_preference',
            'accommodation_preference'
        ]