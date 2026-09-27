import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  ShieldCheck,
  Landmark,
  ArrowRight,
} from "lucide-react";

import DashboardSidebar from "../components/DashboardSidebar";
import mountainBg from "../assets/mountain-bg.png";


function DestinationDetail() {

  const attractions = [
    "Nainital Lake",
    "Naina Devi Temple",
    "Snow View Point",
    "Mall Road",
  ];

  return (
    <div className="travel-page">

      <DashboardSidebar active="smart-map" />

      <main className="travel-main">

        <div className="travel-topbar">
          <div className="travel-profile">
            <div className="travel-avatar">AR</div>

            <div className="travel-profile-text">
              <strong>Anubhuti</strong>
              <span>Traveler</span>
            </div>
          </div>
        </div>

        <div className="travel-content">

          <div className="destination-detail-hero travel-card">

            <img
              src={mountainBg}
              alt="Nainital"
            />

            <div className="destination-detail-overlay">

              <span>DESTINATION</span>

              <h1>Nainital</h1>

              <p>
                Uttarakhand, India
              </p>

              <div className="destination-tags">

                <span>
                  <MapPin size={12} />
                  Mountains
                </span>

                <span>
                  Nature
                </span>

                <span>
                  Lakes
                </span>

              </div>

            </div>

            <Link
              to="/plan-trip"
              className="destination-plan-button"
            >
              Plan a Trip
            </Link>

          </div>


          <div className="destination-detail-grid">

            <div>

              <div className="travel-card detail-description">

                <h2>About Nainital</h2>

                <p>
                  Nainital is a popular hill destination
                  known for its scenic lake, mountain views,
                  pleasant climate and surrounding nature.
                </p>

              </div>


              <div className="travel-card attractions-card">

                <h2>Top Attractions</h2>

                <div className="attraction-grid">

                  {attractions.map((item) => (

                    <div
                      className="attraction"
                      key={item}
                    >

                      <img
                        src={mountainBg}
                        alt={item}
                      />

                      <div>
                        <strong>{item}</strong>

                        <span>
                          Explore place
                        </span>
                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>


            <div className="destination-side">

              <div className="travel-card destination-score">

                <div className="score-circle">
                  <strong>82</strong>
                </div>

                <div>
                  <span>SAFETY SCORE</span>
                  <h3>Good</h3>
                </div>

              </div>


              <div className="travel-card detail-features">

                <div>
                  <ShieldCheck />
                  <span>
                    WomenSafe information
                  </span>
                </div>

                <div>
                  <Landmark />
                  <span>
                    Heritage information
                  </span>
                </div>

                <div>
                  <Star />
                  <span>
                    Popular attractions
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default DestinationDetail;