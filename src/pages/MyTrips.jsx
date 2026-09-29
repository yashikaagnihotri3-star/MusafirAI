import Sidebar from "../components/Sidebar";

function MyTrips() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">
          <div>
            <h1>My Trips</h1>
            <p>Manage all your planned journeys.</p>
          </div>

          <button className="primary-button">
            + New Trip
          </button>
        </header>

        <div className="trip-tabs">
          <button className="active">Upcoming</button>
          <button>Completed</button>
          <button>Saved</button>
        </div>

        <div className="trip-list">

          <div className="trip-list-card">

            <div className="trip-thumbnail">
              🏔️
            </div>

            <div className="trip-list-content">

              <span>UPCOMING</span>

              <h2>Uttarakhand Journey</h2>

              <p>
                Mussoorie • Nainital • Rishikesh
              </p>

              <div className="trip-meta">
                <span>📅 Oct 12 - Oct 15</span>
                <span>👥 2 Travelers</span>
                <span>₹15,050</span>
              </div>

            </div>

            <button className="view-trip-button">
              View Trip →
            </button>

          </div>

          <div className="trip-list-card">

            <div className="trip-thumbnail jaipur-thumb">
              🏰
            </div>

            <div className="trip-list-content">

              <span>COMPLETED</span>

              <h2>Jaipur Heritage Trip</h2>

              <p>
                City Palace • Amber Fort • Hawa Mahal
              </p>

              <div className="trip-meta">
                <span>📅 Aug 4 - Aug 7</span>
                <span>👥 2 Travelers</span>
                <span>₹12,500</span>
              </div>

            </div>

            <button className="view-trip-button">
              View Trip →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default MyTrips;