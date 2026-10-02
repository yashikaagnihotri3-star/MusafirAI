import { useEffect, useRef, useState } from "react";
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

  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = useRef(null);

  // --------------------------------------------------
  // FETCH PROFILE
  // --------------------------------------------------

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/api/accounts/profile/");

        setProfile(data);

        setFormData({
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --------------------------------------------------
  // LOAD PROFILE IMAGE
  // --------------------------------------------------

  useEffect(() => {
    const savedImage = localStorage.getItem("musafirProfileImage");

    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // ENABLE EDIT MODE
  // --------------------------------------------------

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  // --------------------------------------------------
  // CANCEL EDITING
  // --------------------------------------------------

  const handleCancel = () => {
    setFormData({
      email: profile.email || "",
      phone: profile.phone || "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await apiRequest("/api/accounts/profile/", {
        method: "PUT",
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
        }),
      });

      setProfile(data);

      setFormData({
        email: data.email || "",
        phone: data.phone || "",
      });

      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // PROFILE IMAGE
  // --------------------------------------------------

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (typeof imageData === "string") {
        setProfileImage(imageData);
        localStorage.setItem("musafirProfileImage", imageData);
      }
    };

    reader.onerror = () => {
      alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);

    // Allow selecting the same image again later.
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    localStorage.removeItem("musafirProfileImage");
  };

  // --------------------------------------------------
  // DISPLAY DATA
  // --------------------------------------------------

  const firstLetter =
    profile.username?.charAt(0)?.toUpperCase() || "U";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        {/* TOP BAR */}
        <header className="app-topbar">
          <div>
            <h1>Profile & Settings</h1>
            <p>Manage your account and travel preferences.</p>
          </div>
        </header>

        {/* LOADING */}
        {loading && <p>Loading profile...</p>}

        {/* ERROR */}
        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* SUCCESS */}
        {success && (
          <p style={{ color: "green" }}>
            {success}
          </p>
        )}

        {/* PROFILE CONTENT */}
        {!loading && (
          <div className="profile-layout">
            {/* ==========================================
                PROFILE CARD
            ========================================== */}

            <section className="profile-card">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="profile-avatar-image"
                    />
                  ) : (
                    firstLetter
                  )}
                </div>

                <button
                  type="button"
                  className="profile-camera-button"
                  onClick={handleUploadClick}
                  title="Change profile picture"
                >
                  +
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />

              <h2>{profile.username || "User"}</h2>

              <p>Traveler</p>

              <div className="profile-image-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleUploadClick}
                >
                  {profileImage ? "Change Photo" : "Upload Photo"}
                </button>

                {profileImage && (
                  <button
                    type="button"
                    className="remove-photo-button"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </button>
                )}
              </div>
            </section>

            {/* ==========================================
                SETTINGS CARD
            ========================================== */}

            <section className="settings-card">
              <span>PERSONAL INFORMATION</span>

              <h2>Account Details</h2>

              {/* NAME */}
              <div className="settings-row">
                <div>
                  <small>Name</small>

                  <strong>
                    {profile.username || "Not available"}
                  </strong>
                </div>
              </div>

              {/* EMAIL */}
              <div className="settings-row">
                <div>
                  <small>Email</small>

                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <strong>
                      {profile.email || "Not available"}
                    </strong>
                  )}
                </div>
              </div>

              {/* PHONE */}
              <div className="settings-row">
                <div>
                  <small>Phone</small>

                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <strong>
                      {profile.phone || "Not available"}
                    </strong>
                  )}
                </div>
              </div>

              {/* TRAVEL STYLE */}
              <div className="settings-row">
                <div>
                  <small>Travel Style</small>

                  <strong>
                    Adventure & Culture
                  </strong>
                </div>
              </div>

              {/* PREFERRED DESTINATION */}
              <div className="settings-row">
                <div>
                  <small>Preferred Destination</small>

                  <strong>
                    Mountain destinations
                  </strong>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="settings-actions">
                {!editing ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleCancel}
                      disabled={saving}
                      style={{ marginLeft: "10px" }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfileSettings;