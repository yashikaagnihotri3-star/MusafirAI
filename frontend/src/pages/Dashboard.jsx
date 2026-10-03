import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import mountainBg from "../assets/mountain-bg.png";
import { apiRequest } from "../api/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function calculateTravelDays(trips) {
  return trips.reduce((total, trip) => {
    if (!trip.start_date || !trip.end_date) {
      return total;
    }

    const start = new Date(`${trip.start_date}T00:00:00`);
    const end = new Date(`${trip.end_date}T00:00:00`);

    const difference =
      Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return total + Math.max(difference, 0);
  }, 0);
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Dates not available";
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const startText = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const endText = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${startText} - ${endText}`;
}

function getTripDays(trip) {
  if (!trip?.start_date || !trip?.end_date) {
    return 0;
  }

  const start = new Date(`${trip.start_date}T00:00:00`);
  const end = new Date(`${trip.end_date}T00:00:00`);

  return Math.max(
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1,
    0
  );
}

function getTripStatus(trip) {
  if (!trip?.start_date || !trip?.end_date) {
    return "Planned";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(`${trip.start_date}T00:00:00`);
  const end = new Date(`${trip.end_date}T00:00:00`);

  if (today < start) {
    return "Planned";
  }

  if (today >= start && today <= end) {
    return "Ongoing";
  }

  return "Completed";
}

function getDestinationIcon(destination) {
  const value = destination.toLowerCase();

  if (
    value.includes("manali") ||
    value.includes("uttarakhand") ||
    value.includes("mussoorie") ||
    value.includes("nainital")
  ) {
    return "🏔️";
  }

  if (
    value.includes("jaipur") ||
    value.includes("agra") ||
    value.includes("delhi")
  ) {
    return "🏰";
  }

  if (
    value.includes("rishikesh") ||
    value.includes("goa")
  ) {
    return "🌊";
  }

  return "📍";
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [trips, setTrips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const notifications = [];

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, preferencesData, tripsData] =
          await Promise.all([
            apiRequest("/api/accounts/profile/"),
            apiRequest("/api/accounts/preferences/"),
            apiRequest("/api/trips/"),
          ]);

        if (!mounted) {
          return;
        }

        setUser({
          id: profileData.id,
          name: profileData.username,
          email: profileData.email,
          phone: profileData.phone,
          initials: getInitials(profileData.username),
        });

        setPreferences(preferencesData);

        const tripData = Array.isArray(tripsData)
          ? tripsData
          : Array.isArray(tripsData.results)
          ? tripsData.results
          : [];

        setTrips(tripData);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err.message || "Unable to load dashboard data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const totalTrips = trips.length;

  const destinationNames = [
    ...new Map(
      trips
        .filter((trip) => trip.destination)
        .map((trip) => [
          trip.destination.trim().toLowerCase(),
          trip.destination.trim(),
        ])
    ).values(),
  ];

  const placesExplored = destinationNames.length;

  const travelDays = calculateTravelDays(trips);

  const recentTrip = trips.length > 0 ? trips[0] : null;

  const popularDestinations = destinationNames
    .slice(0, 4)
    .map((destination) => ({
      name: destination,
      description: "Your travel destination",
      icon: getDestinationIcon(destination),
    }));

  const displayName = user?.name || "Loading...";
  const displayInitials = user?.initials || "U";
  const displayEmail = user?.email || "Email not available";

  const travelStyle =
    preferences?.travel_style?.trim() || "Not set";

  const travelInterests = preferences
    ? [
        preferences.food_preference,
        preferences.accommodation_preference,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">

        {/* TOPBAR */}
        <header className="app-topbar">

          <div>
            <h1>
              Welcome Back, {displayName} 👋
            </h1>

            <p>
              Ready for your next journey?
            </p>
          </div>

          <div className="topbar-right">

            {/* NOTIFICATIONS */}
            <div className="notification-wrapper">

              <button
                className="notification-button"
                onClick={() =>
                  setNotificationOpen(!notificationOpen)
                }
                type="button"
                aria-label="Notifications"
              >
                🔔
              </button>

              {notificationOpen && (
                <div className="notification-dropdown">

                  <div className="notification-header">
                    <h3>Notifications</h3>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="no-notifications">

                      <div className="no-notification-icon">
                        🔔
                      </div>

                      <p>No notifications</p>

                    </div>
                  ) : (
                    <div className="notification-list">

                      {notifications.map(
                        (notification, index) => (
                          <div
                            className="notification-item"
                            key={index}
                          >
                            <p>
                              {notification.message}
                            </p>

                            <span>
                              {notification.time}
                            </span>
                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* PROFILE */}
            <div className="profile-wrapper">

              <button
                type="button"
                className="topbar-profile"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
              >

                <div className="topbar-avatar">
                  {displayInitials}
                </div>

                <div className="topbar-profile-info">

                  <strong>
                    {displayName}
                  </strong>

                  <small>
                    Traveler
                  </small>

                </div>

              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="profile-dropdown">

                  <div className="profile-dropdown-header">

                    <div className="dropdown-avatar">
                      {displayInitials}
                    </div>

                    <div className="dropdown-user-info">

                      <strong>
                        {displayName}
                      </strong>

                      <span>
                        {displayEmail}
                      </span>

                    </div>

                  </div>

                  <div className="profile-divider"></div>

                  <div className="travel-info-title">
                    TRAVEL INFO
                  </div>

                  {/* TRAVELER TYPE */}
                  <div className="travel-info-item">

                    <div className="travel-info-icon">
                      👥
                    </div>

                    <div className="travel-info-text">

                      <strong>
                        Traveler Type
                      </strong>

                      <span>
                        {travelStyle}
                      </span>

                    </div>

                  </div>

                  {/* DESTINATIONS */}
                  <div className="travel-info-item">

                    <div className="travel-info-icon">
                      📍
                    </div>

                    <div className="travel-info-text">

                      <strong>
                        Destinations
                      </strong>

                      <span>
                        {placesExplored > 0
                          ? destinationNames.join(", ")
                          : "No destinations yet"}
                      </span>

                    </div>

                  </div>

                  {/* TRAVEL INTERESTS */}
                  <div className="travel-info-item">

                    <div className="travel-info-icon">
                      ☆
                    </div>

                    <div className="travel-info-text">

                      <strong>
                        Travel Interests
                      </strong>

                      <span>
                        {travelInterests || "Not set"}
                      </span>

                    </div>

                  </div>

                  <div className="profile-divider"></div>

                  <Link
                    to="/settings"
                    className="profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                  >

                    <span className="menu-item-icon">
                      ⚙
                    </span>

                    <span>
                      Settings
                    </span>

                    <span className="menu-item-arrow">
                      ›
                    </span>

                  </Link>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* ERROR */}
        {error && (
          <div
            style={{
              margin: "16px 0",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff1f1",
              color: "#b42318",
              border: "1px solid #f5c2c2",
            }}
          >
            {error}
          </div>
        )}

        {/* WELCOME */}
        <section className="dashboard-welcome">

          <div className="welcome-left">

            <span className="small-label">
              YOUR NEXT ADVENTURE
            </span>

            <h2>
              Where will you
              <br />
              go next?
            </h2>

            <p>
              Plan your perfect journey with personalized
              itineraries and smart travel insights.
            </p>

            <Link
              to="/plan-trip"
              className="primary-button"
            >
              Plan a Trip →
            </Link>

          </div>

          <div className="welcome-visual">

            <img
              src={mountainBg}
              alt="Mountain travel destination"
            />

          </div>

        </section>

        {/* QUICK STATS */}
        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon blue">
              ✈
            </div>

            <div>

              <span>Total Trips</span>

              <strong>
                {loading ? "..." : totalTrips}
              </strong>

              <small>
                {totalTrips === 0
                  ? "No trips yet"
                  : `${totalTrips} trip${
                      totalTrips === 1 ? "" : "s"
                    } recorded`}
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon teal">
              ⌖
            </div>

            <div>

              <span>Places Explored</span>

              <strong>
                {loading ? "..." : placesExplored}
              </strong>

              <small>
                {placesExplored === 0
                  ? "No destinations yet"
                  : "Unique destinations"}
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon pink">
              ♡
            </div>

            <div>

              <span>Destinations</span>

              <strong>
                {loading ? "..." : destinationNames.length}
              </strong>

              <small>
                From your trips
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              ★
            </div>

            <div>

              <span>Travel Days</span>

              <strong>
                {loading ? "..." : travelDays}
              </strong>

              <small>
                Across your trips
              </small>

            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-section">

          <div className="section-title">

            <div>

              <span>
                GET STARTED
              </span>

              <h2>
                Quick Actions
              </h2>

            </div>

          </div>

          <div className="quick-action-grid">

            <Link
              to="/plan-trip"
              className="quick-card"
            >

              <div className="quick-icon blue">
                ✈
              </div>

              <h3>
                Plan a Trip
              </h3>

              <p>
                Create your personalized itinerary
              </p>

              <span>
                →
              </span>

            </Link>

            <Link
              to="/my-trips"
              className="quick-card"
            >

              <div className="quick-icon teal">
                ▣
              </div>

              <h3>
                My Trips
              </h3>

              <p>
                View your planned journeys
              </p>

              <span>
                →
              </span>

            </Link>

            <Link
              to="/womensafe"
              className="quick-card"
            >

              <div className="quick-icon pink">
                ♡
              </div>

              <h3>
                WomenSafe
              </h3>

              <p>
                Travel with greater confidence
              </p>

              <span>
                →
              </span>

            </Link>

            <Link
              to="/heritage"
              className="quick-card"
            >

              <div className="quick-icon orange">
                ▤
              </div>

              <h3>
                Heritage Guide
              </h3>

              <p>
                Explore culture and history
              </p>

              <span>
                →
              </span>

            </Link>

          </div>

        </section>

        {/* POPULAR DESTINATIONS */}
        <section className="dashboard-section">

          <div className="section-title-row">

            <div>

              <span>
                EXPLORE
              </span>

              <h2>
                Your Destinations
              </h2>

            </div>

            <Link to="/my-trips">
              View all →
            </Link>

          </div>

          <div className="destination-grid-dashboard">

            {loading ? (

              <div className="dashboard-destination">

                <div className="destination-details">

                  <h3>
                    Loading destinations...
                  </h3>

                </div>

              </div>

            ) : popularDestinations.length === 0 ? (

              <div className="dashboard-destination">

                <div className="destination-details">

                  <h3>
                    No destinations yet
                  </h3>

                  <p>
                    Create your first trip to see it here.
                  </p>

                </div>

              </div>

            ) : (

              popularDestinations.map((destination) => (

                <div
                  className="dashboard-destination"
                  key={destination.name}
                >

                  <div className="destination-image uttarakhand">
                    {destination.icon}
                  </div>

                  <div className="destination-details">

                    <h3>
                      {destination.name}
                    </h3>

                    <p>
                      {destination.description}
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

        {/* RECENT TRIP */}
        <section className="dashboard-section">

          <div className="section-title-row">

            <div>

              <span>
                RECENT
              </span>

              <h2>
                Your Recent Trip
              </h2>

            </div>

            <Link to="/my-trips">
              View all →
            </Link>

          </div>

          <div className="recent-trip-card">

            {loading ? (

              <div className="recent-trip-content">

                <h3>
                  Loading your recent trip...
                </h3>

              </div>

            ) : recentTrip ? (

              <>

                <div className="recent-trip-image">
                  {getDestinationIcon(
                    recentTrip.destination || ""
                  )}
                </div>

                <div className="recent-trip-content">

                  <div className="trip-top-line">

                    <span>
                      {getTripStatus(
                        recentTrip
                      ).toUpperCase()}
                    </span>

                    <strong>
                      {getTripDays(recentTrip)} Days
                    </strong>

                  </div>

                  <h3>
                    {recentTrip.title ||
                      recentTrip.destination}
                  </h3>

                  <p>
                    {recentTrip.source
                      ? `${recentTrip.source} • `
                      : ""}
                    {recentTrip.destination}
                  </p>

                  <div className="trip-info">

                    <span>
                      📅{" "}
                      {formatDateRange(
                        recentTrip.start_date,
                        recentTrip.end_date
                      )}
                    </span>

                    <span>
                      💰{" "}
                      {recentTrip.budget !== null &&
                      recentTrip.budget !== undefined
                        ? `₹${Number(
                            recentTrip.budget
                          ).toLocaleString("en-IN")}`
                        : "Budget not set"}
                    </span>

                  </div>

                  <Link
                    to="/my-trips"
                    className="secondary-button"
                  >
                    View Trip →
                  </Link>

                </div>

                <div className="trip-status">

                  <span>
                    STATUS
                  </span>

                  <strong>
                    {getTripStatus(recentTrip)}
                  </strong>

                </div>

              </>

            ) : (

              <div className="recent-trip-content">

                <div className="trip-top-line">

                  <span>
                    NO TRIPS
                  </span>

                </div>

                <h3>
                  You haven't created a trip yet
                </h3>

                <p>
                  Start planning your first journey with MusafirAI.
                </p>

                <Link
                  to="/plan-trip"
                  className="secondary-button"
                >
                  Plan a Trip →
                </Link>

              </div>

            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;