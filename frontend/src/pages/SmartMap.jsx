import Sidebar from "../components/Sidebar";

function SmartMap() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">
          <div>
            <h1>Smart Map</h1>
            <p>Explore destinations and places around you.</p>
          </div>
        </header>

        <div className="coming-soon-page">

          <div className="coming-soon-icon">
            🗺️
          </div>

          <span>SMART MAP</span>

          <h2>Coming Soon</h2>

          <p>
            Our interactive travel map is currently under development.
            Soon you will be able to explore destinations, attractions,
            routes and nearby places.
          </p>

        </div>

      </main>
    </div>
  );
}

export default SmartMap;