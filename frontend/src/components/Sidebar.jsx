import { NavLink, Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");

    navigate("/", { replace: true });
  };

  return (
    <aside className="app-sidebar">

      <Link to="/dashboard" className="sidebar-brand">
        <div className="sidebar-brand-icon">✦</div>

        <div>
          <strong>
            Musafir<span>AI</span>
          </strong>

          <small>
            Travel Companion
          </small>
        </div>
      </Link>

      <div className="sidebar-menu">

        <p className="sidebar-heading">
          MAIN MENU
        </p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>⌂</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/plan-trip"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>✈</span>
          Plan Trip
        </NavLink>

        <NavLink
          to="/my-trips"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>▣</span>
          My Trips
        </NavLink>

        <NavLink
          to="/smart-map"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>⌖</span>
          Smart Map
        </NavLink>

        <NavLink
          to="/womensafe"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>♡</span>
          WomenSafe
        </NavLink>

        <NavLink
          to="/heritage"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>▤</span>
          Heritage Guide
        </NavLink>

        <NavLink
          to="/ai-assistant"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>✦</span>
          AI Assistant
        </NavLink>

        <p className="sidebar-heading account-heading">
          ACCOUNT
        </p>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span>⚙</span>
          Settings
        </NavLink>

        <button
          type="button"
          className="sidebar-item logout-item"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </div>

      <div className="sidebar-bottom-card">

        <div className="sidebar-bottom-icon">
          ✦
        </div>

        <div>
          <strong>
            MusafirAI
          </strong>

          <p>
            Travel smarter.
          </p>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;