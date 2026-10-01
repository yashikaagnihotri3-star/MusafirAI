import { useState } from "react";
import {
  Bell,
  History,
  Headphones,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

function HeritageGuide() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();

    const place = searchLocation.trim();

    if (!place) {
      setSelectedPlace("");
      return;
    }

    setSelectedPlace(place);
  };

  return (
    <div className="app-layout">

      {/* EXISTING SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <main className="app-main">

        {/* SAME TOPBAR STYLE AS DASHBOARD */}
        <header className="app-topbar">

          <div>
            <h1>Heritage Guide</h1>
            <p>
              Discover the history and heritage of the places you want to
              explore.
            </p>
          </div>


          <div className="topbar-right">

            


            


                  
                  
          </div>

        </header>


        
        <div className="heritage-guide-content">

          {/* PAGE TITLE */}

          <div className="heritage-guide-heading">

            

            

          </div>


          {/* SEARCH CARD */}

          <section className="heritage-search-card">

            <div className="heritage-search-header">

              <div className="heritage-search-icon">
                🔍
              </div>

              <div>

                <h3>
                  Search a Place
                </h3>

                <p>
                  Enter the name of a city, monument, historical site or
                  heritage destination.
                </p>

              </div>

            </div>


            <form
              className="heritage-search-form"
              onSubmit={handleSearch}
            >

              <div className="heritage-input-wrapper">

                <span className="heritage-input-icon">
                  🔍
                </span>

                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) =>
                    setSearchLocation(e.target.value)
                  }
                  placeholder="Search city, monument or heritage place..."
                />

              </div>


              <button
                type="submit"
                className="heritage-search-button"
              >
                Search
              </button>

            </form>

          </section>


          {/* START EXPLORING */}

          {!selectedPlace && (

            <section className="heritage-empty-card">

              <div className="heritage-empty-icon">
                🏛️
              </div>

              <h3>
                Start Exploring
              </h3>

              <p>
                Search for a city, monument or historical destination
                to discover its heritage.
              </p>

            </section>

          )}


          {/* RESULT */}

          {selectedPlace && (

            <section className="heritage-result-card">

              <div className="heritage-result-icon">
                🏛️
              </div>


              <div className="heritage-result-content">

                <span className="heritage-result-label">
                  HERITAGE DESTINATION
                </span>

                <h3>
                  {selectedPlace}
                </h3>

                <p>
                  Explore the historical and cultural significance of{" "}
                  {selectedPlace}.
                </p>


                <div className="heritage-action-buttons">

                  {/* INACTIVE */}
                  <button
                    type="button"
                    disabled
                    className="heritage-disabled-button"
                  >

                    <History size={18} />

                    <div>
                      <strong>
                        View History
                      </strong>

                      <span>
                        Coming Soon
                      </span>
                    </div>

                  </button>


                  {/* INACTIVE */}
                  <button
                    type="button"
                    disabled
                    className="heritage-disabled-button"
                  >

                    <Headphones size={18} />

                    <div>
                      <strong>
                        Listen to History
                      </strong>

                      <span>
                        Coming Soon
                      </span>
                    </div>

                  </button>

                </div>

              </div>

            </section>

          )}

        </div>

      </main>

    </div>
  );
}

export default HeritageGuide;