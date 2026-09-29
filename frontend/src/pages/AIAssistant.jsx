import Sidebar from "../components/Sidebar";

function AIAssistant() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="app-main">

        <header className="app-topbar">

          <div>
            <h1>AI Assistant</h1>
            <p>Your personal travel planning companion.</p>
          </div>

        </header>

        <div className="assistant-layout">

          <section className="assistant-card">

            <div className="assistant-icon">
              ✦
            </div>

            <h2>
              Hi! I'm your MusafirAI assistant.
            </h2>

            <p>
              Ask me about destinations, itineraries,
              travel tips, culture or activities.
            </p>

            <div className="assistant-suggestions">

              <button>
                Plan a trip to Uttarakhand
              </button>

              <button>
                What should I visit in Jaipur?
              </button>

              <button>
                Give me travel safety tips
              </button>

            </div>

            <div className="assistant-input">
              <input
                type="text"
                placeholder="Ask your travel question..."
              />

              <button>
                →
              </button>
            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default AIAssistant;