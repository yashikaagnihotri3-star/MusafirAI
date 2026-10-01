
import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import mountainBg from "../assets/mountain-bg.png";

function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

const notifications = [];
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        {/* TOPBAR */}
        <header className="app-topbar">

          <div>
            <h1>Welcome Back, User 👋</h1>
            <p>Ready for your next journey?</p>
          </div>

          <div className="topbar-right">

            <div className="notification-wrapper">
  <button
    className="notification-button"
    onClick={() => setNotificationOpen(!notificationOpen)}
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
          <div className="no-notification-icon">🔔</div>
          <p>No notifications</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <div className="notification-item" key={index}>
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          ))}
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
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <div className="topbar-avatar">
                  U
                </div>

                <div className="topbar-profile-info">
                  <strong>User Name</strong>
                  <small>Traveler</small>
                </div>

                
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="profile-dropdown">

                  {/* USER INFORMATION */}
                  <div className="profile-dropdown-header">

                    <div className="dropdown-avatar">
                      U
                    </div>

                    <div className="dropdown-user-info">
                      <strong>User Name</strong>
                      <span>user@example.com</span>
                    </div>

                  </div>

                  <div className="profile-divider"></div>

                  {/* TRAVEL INFO */}
                  <div className="travel-info-title">
                    TRAVEL INFO
                  </div>

                  <div className="travel-info-item">

                    <div className="travel-info-icon">
                      👥
                    </div>

                    <div className="travel-info-text">
                      <strong>Traveler Type</strong>
                      <span>Solo</span>
                    </div>

                    

                  </div>

                  <div className="travel-info-item">

                    <div className="travel-info-icon">
                      📍
                    </div>

                    <div className="travel-info-text">
                      <strong>Preferred Destinations</strong>
                      <span>Mountains, Heritage</span>
                    </div>

                    

                  </div>

                  <div className="travel-info-item">

                    <div className="travel-info-icon">
                      ☆
                    </div>

                    <div className="travel-info-text">
                      <strong>Travel Interests</strong>
                      <span>Adventure, Nature, Culture</span>
                    </div>

                    

                  </div>

                  <div className="profile-divider"></div>

                  

                  {/* SETTINGS */}
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
              <strong>12</strong>
              <small>+2 this month</small>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon teal">
              ⌖
            </div>

            <div>
              <span>Places Explored</span>
              <strong>28</strong>
              <small>Across 8 states</small>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon pink">
              ♡
            </div>

            <div>
              <span>Saved Places</span>
              <strong>24</strong>
              <small>8 destinations</small>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              ★
            </div>

            <div>
              <span>Travel Days</span>
              <strong>42</strong>
              <small>This year</small>
            </div>

          </div>

        </section>


        {/* QUICK ACTIONS */}
        <section className="dashboard-section">

          <div className="section-title">

            <div>
              <span>GET STARTED</span>
              <h2>Quick Actions</h2>
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

              <h3>Plan a Trip</h3>

              <p>
                Create your personalized itinerary
              </p>

              <span>→</span>

            </Link>


            <Link
              to="/my-trips"
              className="quick-card"
            >

              <div className="quick-icon teal">
                ▣
              </div>

              <h3>My Trips</h3>

              <p>
                View your planned journeys
              </p>

              <span>→</span>

            </Link>


            <Link
              to="/womensafe"
              className="quick-card"
            >

              <div className="quick-icon pink">
                ♡
              </div>

              <h3>WomenSafe</h3>

              <p>
                Travel with greater confidence
              </p>

              <span>→</span>

            </Link>


            <Link
              to="/heritage"
              className="quick-card"
            >

              <div className="quick-icon orange">
                ▤
              </div>

              <h3>Heritage Guide</h3>

              <p>
                Explore culture and history
              </p>

              <span>→</span>

            </Link>

          </div>

        </section>


        {/* POPULAR DESTINATIONS */}
        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <span>EXPLORE</span>
              <h2>Popular Destinations</h2>
            </div>

            <Link to="/plan-trip">
              View all →
            </Link>

          </div>


          <div className="destination-grid-dashboard">

            <div className="dashboard-destination">

              <div className="destination-image uttarakhand">
                🏔️
              </div>

              <div className="destination-details">
                <h3>Uttarakhand</h3>
                <p>Mountains • Nature</p>
              </div>

            </div>


            <div className="dashboard-destination">

              <div className="destination-image manali">
                ❄️
              </div>

              <div className="destination-details">
                <h3>Manali</h3>
                <p>Adventure • Snow</p>
              </div>

            </div>


            <div className="dashboard-destination">

              <div className="destination-image jaipur">
                🏰
              </div>

              <div className="destination-details">
                <h3>Jaipur</h3>
                <p>Heritage • Culture</p>
              </div>

            </div>


            <div className="dashboard-destination">

              <div className="destination-image rishikesh">
                🌊
              </div>

              <div className="destination-details">
                <h3>Rishikesh</h3>
                <p>Adventure • Spiritual</p>
              </div>

            </div>

          </div>

        </section>


        {/* RECENT TRIP */}
        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <span>RECENT</span>
              <h2>Your Recent Trip</h2>
            </div>

            <Link to="/my-trips">
              View all →
            </Link>

          </div>


          <div className="recent-trip-card">

            <div className="recent-trip-image">
              🏔️
            </div>


            <div className="recent-trip-content">

              <div className="trip-top-line">
                <span>UPCOMING TRIP</span>
                <strong>3 Days</strong>
              </div>

              <h3>
                Uttarakhand Journey
              </h3>

              <p>
                Mussoorie • Nainital • Rishikesh
              </p>

              <div className="trip-info">
                <span>📅 Oct 12 - Oct 15, 2026</span>
                <span>👥 2 Travelers</span>
              </div>

              <Link
                to="/my-trips"
                className="secondary-button"
              >
                View Trip →
              </Link>

            </div>


            <div className="trip-status">

              <span>STATUS</span>

              <strong>
                Planned
              </strong>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
