import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import Sidebar from "../components/Sidebar";

function SmartMap() {
  const center = {
    lat: 20,
    lng: 0,
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="app-main">

        {/* TOPBAR */}
        <header className="app-topbar">

          <div>
            <h1>Smart Map</h1>
            <p>Explore destinations and places around the world.</p>
          </div>

          <div className="topbar-right">

            <button className="notification-button">
              <div className="bell">🔔</div>
              <span></span>
            </button>

            <div className="topbar-profile">

              <div className="topbar-avatar">
                U
              </div>

              <div>
                <strong>User Name</strong>
                <small>Traveler</small>
              </div>

            </div>

          </div>

        </header>


        {/* SMART MAP CONTENT */}
        <section className="smart-map-section">

          <div className="smart-map-intro">
            <div>
              <span className="smart-map-label">
                EXPLORE
              </span>

              <h2>
                Explore the World
              </h2>

              <p>
                Search and explore destinations and places around the world.
              </p>
            </div>
          </div>


          {/* MAP */}
          <div className="smart-map-box">

            <APIProvider
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            >

              <Map
                defaultCenter={center}
                defaultZoom={2}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={true}
                streetViewControl={true}
                fullscreenControl={true}
                zoomControl={true}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >

                <Marker
                  position={{
                    lat: 30.0668,
                    lng: 79.0193,
                  }}
                />

              </Map>

            </APIProvider>

          </div>

        </section>

      </main>

    </div>
  );
}

export default SmartMap;