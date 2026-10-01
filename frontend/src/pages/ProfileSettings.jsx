import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

function ProfileSettings() {
  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("musafirProfileImage");

    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setProfileImage(imageData);
      localStorage.setItem("musafirProfileImage", imageData);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    localStorage.removeItem("musafirProfileImage");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">

          <div>
            <h1>Profile & Settings</h1>
            <p>Manage your account and travel preferences.</p>
          </div>

        </header>

        <div className="profile-layout">

          {/* PROFILE CARD */}

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
                  "U"
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

            <h2>User Name</h2>

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


          {/* SETTINGS CARD */}

          <section className="settings-card">

            <span>PERSONAL INFORMATION</span>

            <h2>Account Details</h2>

            <div className="settings-row">
              <div>
                <small>Name</small>
                <strong>User Name</strong>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <small>Email</small>
                <strong>Traveler account</strong>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <small>Travel Style</small>
                <strong>Adventure & Culture</strong>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <small>Preferred Destination</small>
                <strong>Mountain destinations</strong>
              </div>
            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProfileSettings;