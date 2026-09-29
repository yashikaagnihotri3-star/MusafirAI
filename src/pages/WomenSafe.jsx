import Sidebar from "../components/Sidebar";

function WomenSafe() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">

          <div>
            <h1>WomenSafe</h1>
            <p>Travel with greater confidence.</p>
          </div>

        </header>

        <section className="safety-hero">

          <div>
            <span>WOMEN TRAVEL SAFETY</span>

            <h2>
              Your safety,
              <br />
              our priority.
            </h2>

            <p>
              Get destination-specific safety information,
              useful contacts and practical travel guidance.
            </p>
          </div>

          <div className="safety-score">

            <strong>82</strong>

            <span>Safety Score</span>

            <small>Good</small>

          </div>

        </section>

        <section className="safety-grid">

          <div className="safety-card">
            <div>🚨</div>
            <h3>Emergency Contacts</h3>
            <p>Important emergency numbers for your destination.</p>
          </div>

          <div className="safety-card">
            <div>📍</div>
            <h3>Safe Areas</h3>
            <p>Learn about recommended areas for travelers.</p>
          </div>

          <div className="safety-card">
            <div>🕐</div>
            <h3>Travel Tips</h3>
            <p>Useful precautions and practical safety guidance.</p>
          </div>

          <div className="safety-card">
            <div>🏥</div>
            <h3>Nearby Help</h3>
            <p>Find hospitals and other important facilities.</p>
          </div>

        </section>

        <div className="sos-preview-card">

          <div>
            <span>EMERGENCY FEATURE</span>
            <h2>SOS Assistance</h2>
            <p>
              Emergency SOS functionality will be available soon.
            </p>
          </div>

          <button>
            Coming Soon
          </button>

        </div>

      </main>

    </div>
  );
}

export default WomenSafe;