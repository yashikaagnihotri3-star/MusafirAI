import { useEffect, useRef, useState } from "react";
import { APIProvider, Map, Marker, Polyline } from "@vis.gl/react-google-maps";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../api/api";

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access is not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () =>
        reject(
          new Error(
            "Unable to access your location. Allow location access and try again."
          )
        ),
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  });
}


function SmartMap() {
  const [origin, setOrigin] = useState(null);

  const [destination] = useState({
    latitude: 30.0668,
    longitude: 79.0193,
  });

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getUserLocation() {
    setError("");

    try {
      const position = await getCurrentPosition();

      setOrigin({
        latitude: Number(position.latitude.toFixed(8)),
        longitude: Number(position.longitude.toFixed(8)),
      });
    } catch (err) {
      console.error("Location error:", err);
      setError(err.message);
    }
  }

  useEffect(() => {
    getUserLocation();
  }, []);

  async function getRoute() {
    setError("");

    if (!origin) {
      setError("Please allow location access first.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/api/maps/route-preview/", {
        method: "POST",
        body: JSON.stringify({
          origin: origin,
          destination: destination,
        }),
      });

      setRoute(data);
    } catch (err) {
      console.error("Route error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const center = origin
    ? {
        lat: origin.latitude,
        lng: origin.longitude,
      }
    : {
        lat: 20,
        lng: 0,
      };

  const routePath = route
    ? route.path.map((point) => ({
        lat: point.lat,
        lng: point.lng,
      }))
    : [];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <header className="app-topbar">
          <div>
            <h1>Smart Map</h1>
            <p>Explore destinations and places around the world.</p>
          </div>
        </header>

        <section className="smart-map-section">
          <div className="smart-map-intro">
            <div>
              <span className="smart-map-label">EXPLORE</span>

              <h2>Explore the World</h2>

              <p>
                Search and explore destinations and places around the world.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={getUserLocation}
                disabled={loading}
              >
                Use My Location
              </button>

              <button
                type="button"
                onClick={getRoute}
                disabled={loading || !origin}
              >
                {loading ? "Finding Route..." : "Show Route"}
              </button>
            </div>
          </div>

          {error && <p role="alert">{error}</p>}

          {route && (
            <div className="route-info">
              <div>
                <strong>Distance</strong>
                <p>{route.distance.km} km</p>
              </div>

              <div>
                <strong>Travel Time</strong>
                <p>
                  {Math.floor(route.duration.minutes / 60)} hr{" "}
                  {route.duration.minutes % 60} min
                </p>
              </div>
            </div>
          )}

          <div className="smart-map-box">
            <APIProvider
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >
              <Map
                defaultCenter={center}
                defaultZoom={8}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={true}
                streetViewControl={true}
                fullscreenControl={true}
                zoomControl={true}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {origin && (
                  <Marker
                    position={{
                      lat: origin.latitude,
                      lng: origin.longitude,
                    }}
                  />
                )}

                <Marker
                  position={{
                    lat: destination.latitude,
                    lng: destination.longitude,
                  }}
                />

                {routePath.length > 0 && (
  <Polyline
    path={routePath}
    strokeColor="#2563eb"
    strokeOpacity={0.8}
    strokeWeight={5}
  />
)}
              </Map>
            </APIProvider>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SmartMap;