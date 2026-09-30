import Sidebar from "../components/Sidebar";

function HeritageGuide() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">

          <div>
            <h1>Heritage Guide</h1>
            <p>Discover the stories behind incredible places.</p>
          </div>

        </header>

        <section className="heritage-hero">

          <div>
            <span>EXPLORE HISTORY & CULTURE</span>

            <h2>
              Every place
              <br />
              has a story.
            </h2>

            <p>
              Discover historical places, cultural traditions,
              architecture and stories from across India.
            </p>
          </div>

        </section>

        <div className="heritage-grid">

          <div className="heritage-card">
            <div className="heritage-card-image">
              🏰
            </div>

            <div>
              <span>RAJASTHAN</span>
              <h3>Amber Fort</h3>
              <p>History • Architecture</p>
            </div>
          </div>

          <div className="heritage-card">
            <div className="heritage-card-image">
              🕌
            </div>

            <div>
              <span>DELHI</span>
              <h3>Red Fort</h3>
              <p>History • Culture</p>
            </div>
          </div>

          <div className="heritage-card">
            <div className="heritage-card-image">
              🛕
            </div>

            <div>
              <span>UTTAR PRADESH</span>
              <h3>Historical Temples</h3>
              <p>Culture • Spiritual</p>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

export default HeritageGuide;