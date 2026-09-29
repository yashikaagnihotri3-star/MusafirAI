import Sidebar from "../components/Sidebar";

function ProfileSettings() {
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

          <section className="profile-card">

            <div className="profile-avatar">
              U
            </div>

            <h2>User Name</h2>

            <p>Traveler</p>

            <button className="primary-button">
              Edit Profile
            </button>

          </section>

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