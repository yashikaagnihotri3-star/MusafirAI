from django.shortcuts import render
import requests

# Create your views here.
from math import radians, sin, cos, sqrt, atan2

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import DistanceRequestSerializer, SafetyPointsRequestSerializer

def get_nearby_safety_points(latitude, longitude, radius_km, categories):
    """
    Fetch nearby police stations and hospitals from OpenStreetMap
    using the Overpass API.
    """

    category_mapping = {
        "POLICE": '["amenity"="police"]',
        "HOSPITAL": '["amenity"="hospital"]',
    }

    queries = []

    for category in categories:
        if category in category_mapping:
            queries.append(
                f'node{category_mapping[category]}'
                f'(around:{radius_km * 1000},{latitude},{longitude});'
            )

    if not queries:
        return []

    overpass_query = f"""
    [out:json][timeout:10];
    (
        {"".join(queries)}
    );
    out center tags;
    """

    response = requests.post(
        "https://overpass.kumi.systems/api/interpreter",
        data={"data": overpass_query},
        headers={
            "User-Agent": (
                "MusafirAI/1.0 "
                "(Django safety-points hackathon project)"
            ),
            "Referer": "http://127.0.0.1:8000/",
        },
        timeout=25,
    )

    response.raise_for_status()

    return response.json().get("elements", [])

class DistanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DistanceRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid location data.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        origin = serializer.validated_data["origin"]
        destination = serializer.validated_data["destination"]

        lat1 = radians(origin["latitude"])
        lon1 = radians(origin["longitude"])
        lat2 = radians(destination["latitude"])
        lon2 = radians(destination["longitude"])

        earth_radius_km = 6371.0

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance_km = earth_radius_km * c
        distance_meters = distance_km * 1000

        return Response(
            {
                "origin": origin,
                "destination": destination,
                "distance_km": round(distance_km, 2),
                "distance_meters": round(distance_meters),
            },
            status=status.HTTP_200_OK,
        )

class RoutePreviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DistanceRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid location data.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        origin = serializer.validated_data["origin"]
        destination = serializer.validated_data["destination"]

        lat1 = radians(origin["latitude"])
        lon1 = radians(origin["longitude"])
        lat2 = radians(destination["latitude"])
        lon2 = radians(destination["longitude"])

        earth_radius_km = 6371.0

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance_km = earth_radius_km * c
        distance_meters = distance_km * 1000

        return Response(
            {
                "origin": origin,
                "destination": destination,
                "distance": {
                    "km": round(distance_km, 2),
                    "meters": round(distance_meters),
                },
            },
            status=status.HTTP_200_OK,
        )

class SafetyPointsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SafetyPointsRequestSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid safety points request.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        latitude = serializer.validated_data["latitude"]
        longitude = serializer.validated_data["longitude"]
        radius_km = serializer.validated_data["radius_km"]
        categories = serializer.validated_data["categories"]

        try:
            elements = get_nearby_safety_points(
                latitude,
                longitude,
                radius_km,
                categories,
            )

        except requests.RequestException as e:
            print("OVERPASS ERROR:", e)
            return Response(
                {
                    "detail": "Unable to fetch safety points from OpenStreetMap.",
                    "safety_points": [],
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


        safety_points = []

        for element in elements:
            tags = element.get("tags", {})

            # Nodes have lat/lon directly.
            # Ways/relations have coordinates inside "center".
            if "lat" in element and "lon" in element:
                point_latitude = element["lat"]
                point_longitude = element["lon"]

            elif "center" in element:
                point_latitude = element["center"].get("lat")
                point_longitude = element["center"].get("lon")

            else:
                continue

            if point_latitude is None or point_longitude is None:
                continue

            amenity = tags.get("amenity")

            if amenity == "police":
                category = "POLICE"

            elif amenity == "hospital":
                category = "HOSPITAL"

            else:
                continue

            # Calculate distance using Haversine formula.
            distance_km = calculate_haversine_distance(
                latitude,
                longitude,
                point_latitude,
                point_longitude,
            )

            safety_points.append(
                {
                    "name": tags.get(
                        "name",
                        f"Unnamed {category.lower()}",
                    ),
                    "category": category,
                    "latitude": point_latitude,
                    "longitude": point_longitude,
                    "distance_km": round(distance_km, 2),
                }
            )

        # Nearest safety locations first.
        safety_points.sort(
            key=lambda point: point["distance_km"]
        )

        return Response(
            {
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "radius_km": radius_km,
                "categories": categories,
                "safety_points": safety_points,
            },
            status=status.HTTP_200_OK,
        )