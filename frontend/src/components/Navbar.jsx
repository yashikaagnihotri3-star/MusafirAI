import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        <span className="logo-symbol">✦</span>
        Musafir<span className="logo-ai">AI</span>
      </Link>


      {/* NAVIGATION */}
      <div className="navbar-links">

        <a href="#home">
          Home
        </a>

        <a href="#plan-trip">
          Plan Trip
        </a>

        <a href="#smart-map">
          Smart Map
        </a>

        <a href="#women-safety">
          WomenSafe
        </a>

        <a href="#heritage">
          Heritage
        </a>

        <a href="#about">
          About
        </a>

      </div>


      {/* ACTION BUTTONS */}
      <div className="navbar-actions">

        <Link
          to="/login"
          className="navbar-login"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="navbar-start"
        >
          Get Started
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;