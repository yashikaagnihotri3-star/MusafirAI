from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated

from .models import TravelPreference

from .serializers import SignupSerializer
from .serializers import TravelPreferenceSerializer


class SignupView(APIView):

    def post(self, request):

        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    "message": "Account created successfully",
                    "user_id": user.id
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {
                    "error": "Invalid username or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "user_id": user.id,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            },
            status=status.HTTP_200_OK
        )



class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone
        })

    def put(self, request):

        user = request.user

        user.email = request.data.get(
            'email',
            user.email
        )

        user.phone = request.data.get(
            'phone',
            user.phone
        )

        user.save()

        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone
            }
        })

class PreferencesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        preference, created = TravelPreference.objects.get_or_create(
            user=request.user
        )

        serializer = TravelPreferenceSerializer(preference)

        return Response(serializer.data)

    def put(self, request):

        preference, created = TravelPreference.objects.get_or_create(
            user=request.user
        )

        serializer = TravelPreferenceSerializer(
            preference,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "message": "Preferences updated successfully",
                "preferences": serializer.data
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )