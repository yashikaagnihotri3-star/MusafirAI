import Sidebar from "../components/Sidebar";
import mountainBg from "../assets/mountain-bg.png";
function PlanTrip() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">

          <div>
            <h1>Plan Your Journey</h1>
            <p>Create a personalized trip with MusafirAI.</p>
          </div>

          <button className="outline-button">
            Save Draft
          </button>

        </header>

        <div className="plan-layout">

          <section className="plan-form-card">

            <div className="page-card-heading">
              <span>START PLANNING</span>
              <h2>Plan Your Journey</h2>
              <p>
                Tell us about your trip and we'll help you create
                the perfect itinerary.
              </p>
            </div>

            <div className="form-row">

              <div className="form-field">
                <label>Destination</label>

                <select>
                  <option>Uttarakhand</option>
                  <option>Manali</option>
                  <option>Jaipur</option>
                  <option>Rishikesh</option>
                  <option>Nainital</option>
                </select>
              </div>

              <div className="form-field">
                <label>Travelers</label>

                <select>
                  <option>1 Traveler</option>
                  <option>2 Travelers</option>
                  <option>3 Travelers</option>
                  <option>4 Travelers</option>
                  <option>5+ Travelers</option>
                </select>
              </div>

            </div>

            <div className="form-row">

              <div className="form-field">
                <label>Start Date</label>
                <input type="date" />
              </div>

              <div className="form-field">
                <label>End Date</label>
                <input type="date" />
              </div>

            </div>

            <div className="form-field">
              <label>Budget</label>

              <div className="choice-grid">

                <button>Budget</button>
                <button className="selected">Moderate</button>
                <button>Premium</button>

              </div>
            </div>

            <div className="form-field">
              <label>Interests</label>

              <div className="choice-grid">

                <button className="selected">Nature</button>
                <button>Adventure</button>
                <button>Heritage</button>
                <button>Food</button>
                <button>Spiritual</button>
                <button>Shopping</button>

              </div>
            </div>

            <button className="generate-button">
              ✦ Generate My Itinerary
            </button>

          </section>

          <div className="plan-preview">

            <div className="preview-image">
                <img
                  src={mountainBg}
                  alt="Uttarakhand mountains"
                />
              </div>
            <div className="preview-overlay">
              <span>YOUR DESTINATION</span>
              <h2>Uttarakhand</h2>
              <p>Mountains • Nature • Adventure</p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default PlanTrip;