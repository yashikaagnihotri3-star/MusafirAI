import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Map,
  ShieldCheck,
  Landmark,
  Bot,
  Settings,
  Sparkles,
} from "lucide-react";

function DashboardSidebar({ active }) {
  return (
    <aside className="dashboard-sidebar">

      <div className="dashboard-logo">
        <div className="logo-symbol">✦</div>

        <div>
          <h2>
            Musafir<span>AI</span>
          </h2>

          <p>Travel Companion</p>
        </div>
      </div>

      <nav className="dashboard-nav">

        <Link
          to="/dashboard"
          className={`dashboard-nav-item ${
            active === "dashboard" ? "active" : ""
          }`}
        >
          <LayoutDashboard size={19} />
          <span>Home</span>
        </Link>

        <Link
          to="/plan-trip"
          className={`dashboard-nav-item ${
            active === "plan-trip" ? "active" : ""
          }`}
        >
          <CalendarDays size={19} />
          <span>Plan Trip</span>
        </Link>

        <Link
          to="/my-trips"
          className={`dashboard-nav-item ${
            active === "my-trips" ? "active" : ""
          }`}
        >
          <Briefcase size={19} />
          <span>My Trips</span>
        </Link>

        <Link
          to="/smart-map"
          className={`dashboard-nav-item ${
            active === "smart-map" ? "active" : ""
          }`}
        >
          <Map size={19} />
          <span>Explore</span>
        </Link>

        <Link
          to="/womensafe"
          className={`dashboard-nav-item ${
            active === "womensafe" ? "active" : ""
          }`}
        >
          <ShieldCheck size={19} />
          <span>WomenSafe</span>
        </Link>

        <Link
          to="/heritage"
          className={`dashboard-nav-item ${
            active === "heritage" ? "active" : ""
          }`}
        >
          <Landmark size={19} />
          <span>Heritage Guide</span>
        </Link>

        <Link
          to="/ai-assistant"
          className={`dashboard-nav-item ${
            active === "ai-assistant" ? "active" : ""
          }`}
        >
          <Bot size={19} />
          <span>AI Assistant</span>
        </Link>

        <Link
          to="/settings"
          className={`dashboard-nav-item ${
            active === "settings" ? "active" : ""
          }`}
        >
          <Settings size={19} />
          <span>Settings</span>
        </Link>

      </nav>

      <div className="sidebar-bottom">

        <div className="sidebar-help">

          <div className="help-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>Need help?</strong>
            <span>Ask MusafirAI</span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default DashboardSidebar;