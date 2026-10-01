import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../api/api";

function ProfileSettings() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  // Get profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          "/api/accounts/profile/"
        );

        setProfile(data);

        setFormData({
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await apiRequest(
        "/api/accounts/profile/",
        {
          method: "PUT",
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
          }),
        }
      );

      setProfile(data);

      setFormData({
        email: data.email || "",
        phone: data.phone || "",
      });

      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Enable edit mode
  const handleEdit = () => {
    setSuccess("");
    setError("");
    setEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      email: profile.email || "",
      phone: profile.phone || "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  const firstLetter =
    profile.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">
          <div>
            <h1>Profile & Settings</h1>
            <p>
              Manage your account and travel preferences.
            </p>
          </div>
        </header>

        {loading && (
          <p>Loading profile...</p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "green" }}>
            {success}
          </p>
        )}

        {!loading && !error && (
          <div className="profile-layout">

            {/* Profile Card */}
            <section className="profile-card">

              <div className="profile-avatar">
                {firstLetter}
              </div>

              <h2>
                {profile.username || "User"}
              </h2>

              <p>Traveler</p>

              {!editing ? (
                <button
                  className="primary-button"
                  onClick={handleEdit}
                >
                  Edit Profile
                </button>
              ) : (
                <div>

                  <button
                    className="primary-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    className="primary-button"
                    onClick={handleCancel}
                    disabled={saving}
                    style={{ marginLeft: "10px" }}
                  >
                    Cancel
                  </button>

                </div>
              )}

            </section>

            {/* Account Details */}
            <section className="settings-card">

              <span>PERSONAL INFORMATION</span>

              <h2>Account Details</h2>

              {/* Username */}
              <div className="settings-row">
                <div>
                  <small>Name</small>

                  <strong>
                    {profile.username ||
                      "Not available"}
                  </strong>
                </div>
              </div>

              {/* Email */}
              <div className="settings-row">
                <div>
                  <small>Email</small>

                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <strong>
                      {profile.email ||
                        "Not available"}
                    </strong>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="settings-row">
                <div>
                  <small>Phone</small>

                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <strong>
                      {profile.phone ||
                        "Not available"}
                    </strong>
                  )}
                </div>
              </div>

              {/* Frontend-only for now */}
              <div className="settings-row">
                <div>
                  <small>Travel Style</small>

                  <strong>
                    Adventure & Culture
                  </strong>
                </div>
              </div>

              <div className="settings-row">
                <div>
                  <small>
                    Preferred Destination
                  </small>

                  <strong>
                    Mountain destinations
                  </strong>
                </div>
              </div>

            </section>

          </div>
        )}

      </main>

    </div>
  );
}

export default ProfileSettings;