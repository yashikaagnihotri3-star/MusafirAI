import React, { useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import mountainBg from "../assets/mountain-bg.png";
import "../App.css";


function LandingPage() {

  const [search, setSearch] = useState("");


  const destinations = [
    {
      name: "Uttarakhand",
      location: "India",
      description: "Mountains • Nature",
    },
    {
      name: "Manali",
      location: "Himachal Pradesh",
      description: "Adventure • Snow",
    },
    {
      name: "Nainital",
      location: "Uttarakhand",
      description: "Lake • Nature",
    },
    {
      name: "Jaipur",
      location: "Rajasthan",
      description: "Heritage • Culture",
    },
    {
      name: "Rishikesh",
      location: "Uttarakhand",
      description: "Adventure • Spiritual",
    },
    {
      name: "Mussoorie",
      location: "Uttarakhand",
      description: "Mountains • Nature",
    },
  ];


  const filteredDestinations = destinations.filter((destination) =>
    destination.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  return (

    <div className="landing-page">

      <Navbar />


      {/* =================================
          HERO SECTION
      ================================= */}

      <section
        id="home"
        className="landing-hero"
        style={{
          backgroundImage: `url(${mountainBg})`
        }}
      >

        <div className="hero-content">

          <div className="hero-left">

            <div className="hero-label">
              ✦ AI-POWERED TRAVEL PLATFORM
            </div>


            <h1>
              Your AI Travel
              <br />
              <span>Companion</span>
            </h1>


            <h2>
              Plan smarter. Travel safer.
              <br />
              Explore more.
            </h2>


            <p>
              Your intelligent travel companion for
              personalized itineraries, destination
              insights, smart planning and safer journeys.
            </p>


            {/* =================================
                DESTINATION SEARCH
            ================================= */}

            <div
              id="plan-trip"
              className="search-wrapper"
            >

              <div className="trip-search">

                <div className="search-icon">
                  📍
                </div>


                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Where do you want to go?"
                />


                <Link
                  to={
                    search
                      ? `/destination/${search.toLowerCase()}`
                      : "/signup"
                  }
                  className="plan-button"
                >
                  Plan My Trip →
                </Link>

              </div>


              {/* SEARCH SUGGESTIONS */}

              {search && filteredDestinations.length > 0 && (

                <div className="search-results">

                  <div className="search-results-title">
                    Suggested Destinations
                  </div>


                  {filteredDestinations.map((destination) => (

                    <Link
                      key={destination.name}
                      to={`/destination/${destination.name.toLowerCase()}`}
                      className="search-result-item"
                    >

                      <div className="result-icon">
                        📍
                      </div>


                      <div className="result-content">

                        <strong>
                          {destination.name}
                        </strong>

                        <span>
                          {destination.location}
                        </span>

                      </div>


                      <span className="result-arrow">
                        →
                      </span>

                    </Link>

                  ))}

                </div>

              )}


              {search && filteredDestinations.length === 0 && (

                <div className="search-results no-results">

                  No destination found for "{search}"

                </div>

              )}

            </div>

          </div>

        </div>

      </section>


      {/* =================================
          FEATURE CARDS
      ================================= */}

      <section className="feature-section">


        <div className="feature-card">

          <div className="feature-card-icon">
            🗺️
          </div>

          <div>

            <h3>
              AI Itinerary
            </h3>

            <p>
              Personalized travel plans
            </p>

          </div>

        </div>


        <div className="feature-card">

          <div className="feature-card-icon">
            🛡️
          </div>

          <div>

            <h3>
              Smart Safety
            </h3>

            <p>
              Travel with confidence
            </p>

          </div>

        </div>


        <div className="feature-card">

          <div className="feature-card-icon">
            📍
          </div>

          <div>

            <h3>
              Nearby Places
            </h3>

            <p>
              Discover places around you
            </p>

          </div>

        </div>


        <div className="feature-card">

          <div className="feature-card-icon">
            🏛️
          </div>

          <div>

            <h3>
              Heritage Guide
            </h3>

            <p>
              Explore culture & history
            </p>

          </div>

        </div>

      </section>


      {/* =================================
          POPULAR DESTINATIONS
      ================================= */}

      <section className="popular-section">

        <div className="popular-heading">

          <div>

            <span>
              EXPLORE
            </span>

            <h2>
              Popular Destinations
            </h2>

          </div>


          <a
            href="#plan-trip"
            className="view-all"
          >
            View All →
          </a>

        </div>


        <div className="destination-grid">


          {destinations.slice(0, 4).map((destination) => (

            <Link
              key={destination.name}
              to={`/destination/${destination.name.toLowerCase()}`}
              className="destination-card"
            >

              <img
                src={mountainBg}
                alt={destination.name}
              />


              <div className="destination-info">

                <h3>
                  {destination.name}
                </h3>

                <p>
                  {destination.description}
                </p>

              </div>

            </Link>

          ))}

        </div>

      </section>


          {/* =================================
          WHY MUSAFIRAI
      ================================= */}

      <section className="why-section">

        <div className="section-heading">

          <span>
            WHY MUSAFIR AI?
          </span>

          <h2>
            Everything you need for a better journey
          </h2>

          <p>
            From planning your trip to exploring new places,
            MusafirAI brings your travel experience together
            in one intelligent platform.
          </p>

        </div>


        <div className="why-grid">


          <div className="why-card">

            <div className="why-icon">
              ✨
            </div>

            <h3>
              Plan Smarter
            </h3>

            <p>
              Get personalized travel plans based on
              your destination, budget, interests and
              travel preferences.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              🛡️
            </div>

            <h3>
              Travel Safer
            </h3>

            <p>
              Access travel safety information and
              WomenSafe features to make your journey
              more confident.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              📍
            </div>

            <h3>
              Discover More
            </h3>

            <p>
              Find destinations, attractions and
              interesting places around your travel
              location.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              🏛️
            </div>

            <h3>
              Experience Culture
            </h3>

            <p>
              Discover the history, heritage and
              cultural stories behind the places
              you visit.
            </p>

          </div>


        </div>

      </section>


      {/* =================================
          SMART MAP
      ================================= */}

      <section
        id="smart-map"
        className="coming-soon-section"
      >

        <div className="coming-soon-icon">
          🗺️
        </div>


        <div className="coming-soon-content">

          <span>
            SMART MAP
          </span>

          <h2>
            Explore destinations visually
          </h2>

          <p>
            MusafirAI Smart Map will help travellers
            discover destinations, attractions, nearby
            places and important travel locations through
            one interactive map.
          </p>

          <div className="coming-soon-badge">
            Coming Soon
          </div>

        </div>

      </section>


      {/* =================================
          WOMEN SAFETY
      ================================= */}

      <section
        id="women-safety"
        className="women-safety-section"
      >

        <div className="women-safety-content">

          <span className="section-label">
            WOMENSAFE
          </span>

          <h2>
            Travel with greater confidence
          </h2>

          <p className="women-intro">
            MusafirAI is designed to provide women
            travellers with useful safety information
            before and during their journey.
          </p>


          <div className="safety-feature-grid">


            <div className="safety-feature-card">

              <div className="safety-feature-icon">
                🛡️
              </div>

              <div>

                <h3>
                  Safety Information
                </h3>

                <p>
                  Access important safety information
                  related to your destination.
                </p>

              </div>

            </div>


            <div className="safety-feature-card">

              <div className="safety-feature-icon">
                📍
              </div>

              <div>

                <h3>
                  Safer Exploration
                </h3>

                <p>
                  Discover useful locations and
                  travel information while exploring.
                </p>

              </div>

            </div>


            <div className="safety-feature-card">

              <div className="safety-feature-icon">
                👩
              </div>

              <div>

                <h3>
                  Women-Focused Guidance
                </h3>

                <p>
                  Receive travel guidance designed
                  around common concerns of women travellers.
                </p>

              </div>

            </div>


            <div className="safety-feature-card">

              <div className="safety-feature-icon">
                ℹ️
              </div>

              <div>

                <h3>
                  Travel Awareness
                </h3>

                <p>
                  Understand your destination better
                  before starting your journey.
                </p>

              </div>

            </div>


          </div>

        </div>

      </section>


      {/* =================================
          HERITAGE GUIDE
      ================================= */}

      <section
        id="heritage"
        className="heritage-section"
      >

        <div className="heritage-image">

          <img
            src={mountainBg}
            alt="Indian heritage and culture"
          />

        </div>


        <div className="heritage-content">

          <span className="section-label">
            HERITAGE GUIDE
          </span>

          <h2>
            Discover the story behind every destination
          </h2>

          <p>
            MusafirAI helps travellers go beyond sightseeing
            by introducing them to the history, culture and
            heritage of the places they visit.
          </p>


          <div className="heritage-points">


            <div className="heritage-point">

              <span>
                🏛️
              </span>

              <div>

                <h3>
                  Historical Places
                </h3>

                <p>
                  Learn about important historical
                  locations and monuments.
                </p>

              </div>

            </div>


            <div className="heritage-point">

              <span>
                📖
              </span>

              <div>

                <h3>
                  Cultural Stories
                </h3>

                <p>
                  Understand the cultural significance
                  behind the places you explore.
                </p>

              </div>

            </div>


            <div className="heritage-point">

              <span>
                🎭
              </span>

              <div>

                <h3>
                  Local Culture
                </h3>

                <p>
                  Explore traditions, art and cultural
                  experiences of your destination.
                </p>

              </div>

            </div>


          </div>

        </div>

      </section>


      

      {/* =================================
          HOW MUSAFIRAI WORKS
      ================================= */}

      <section className="how-section">

        <div className="section-heading">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Plan your journey in four simple steps
          </h2>

          <p>
            MusafirAI makes travel planning simple,
            personalized and easy to understand.
          </p>

        </div>


        <div className="steps-container">


          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              📍
            </div>

            <h3>
              Choose
            </h3>

            <p>
              Select your destination and
              tell us where you want to go.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              ⚙️
            </div>

            <h3>
              Personalize
            </h3>

            <p>
              Add your dates, budget,
              interests and travel style.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              ✨
            </div>

            <h3>
              Generate
            </h3>

            <p>
              Let MusafirAI create a
              personalized itinerary for you.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              🧳
            </div>

            <h3>
              Explore
            </h3>

            <p>
              Discover places, culture,
              routes and safety information.
            </p>

          </div>


        </div>

      </section>


      {/* =================================
          ABOUT
      ================================= */}

      <section
        id="about"
        className="about-section"
      >

        <div className="about-image">

          <img
            src={mountainBg}
            alt="MusafirAI travel"
          />

        </div>


        <div className="about-content">

          <span>
            ABOUT MUSAFIR AI
          </span>

          <h2>
            Travel planning,
            <br />
            reimagined.
          </h2>

          <p>
            Travel planning often means switching between
            multiple platforms for destinations, itineraries,
            maps, safety information and cultural experiences.
          </p>

          <p>
            MusafirAI brings these experiences together into
            one intelligent travel companion that helps you
            plan smarter, explore more and travel with confidence.
          </p>


          <a
            href="#plan-trip"
            className="about-button"
          >
            Start Exploring →
          </a>

        </div>

      </section>


      {/* =================================
          FINAL CTA
      ================================= */}

      <section className="final-cta">

        <div>

          <span>
            READY TO EXPLORE?
          </span>

          <h2>
            Your next journey starts here.
          </h2>

          <p>
            Discover destinations and plan your
            perfect journey with MusafirAI.
          </p>

        </div>


        <Link
          to="/signup"
          className="cta-button"
        >
          Get Started →
        </Link>

      </section>


      {/* =================================
          FOOTER
      ================================= */}

      <footer className="footer">


        <div className="footer-main">


          <div className="footer-brand">

            <Link
              to="/"
              className="footer-logo"
            >
              ✦ Musafir<span>AI</span>
            </Link>

            <p>
              Your AI Travel Companion.
              Plan smarter, travel safer,
              explore more.
            </p>

          </div>


          <div className="footer-column">

            <h3>
              Explore
            </h3>

            <a href="#home">
              Home
            </a>

            <a href="#plan-trip">
              Plan Trip
            </a>

            <a href="#smart-map">
              Smart Map
            </a>

            <a href="#heritage">
              Heritage
            </a>

          </div>


          <div className="footer-column">

            <h3>
              Travel Safe
            </h3>

            <a href="#women-safety">
              WomenSafe
            </a>

            <a href="#women-safety">
              Safety Guide
            </a>

          </div>


          <div className="footer-column">

            <h3>
              Company
            </h3>

            <a href="#about">
              About
            </a>

            <a href="#about">
              Contact
            </a>

          </div>


        </div>


        <div className="footer-bottom">

          <span>
            © 2026 MusafirAI. All rights reserved.
          </span>

          <span>
            AI-powered travel experiences
          </span>

        </div>


      </footer>


    </div>

  );
}

export default LandingPage;