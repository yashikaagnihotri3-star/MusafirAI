import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../api/api";

const EMPTY_CONTACT = { name: "", phone: "", relationship: "", is_primary: false };

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access is not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => reject(new Error("Unable to access your location. Allow location access and try again.")),
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  });
}

function WomenSafe() {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [nearbyPoints, setNearbyPoints] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function refreshSafetyData() {
    const [contactData, eventData] = await Promise.all([
      apiRequest("/api/safety/contacts/"),
      apiRequest("/api/safety/sos/history/"),
    ]);
    if (!Array.isArray(contactData) || !Array.isArray(eventData)) {
      throw new Error("The safety service returned an unexpected response.");
    }
    setContacts(contactData);
    setEvents(eventData);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest("/api/safety/contacts/"),
      apiRequest("/api/safety/sos/history/"),
    ])
      .then(([contactData, eventData]) => {
        if (!active) return;
        if (!Array.isArray(contactData) || !Array.isArray(eventData)) {
          throw new Error("The safety service returned an unexpected response.");
        }
        setContacts(contactData);
        setEvents(eventData);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function addContact(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await apiRequest("/api/safety/contacts/", {
        method: "POST",
        body: JSON.stringify(contact),
      });
      setContact(EMPTY_CONTACT);
      await refreshSafetyData();
      setMessage("Emergency contact added.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteContact(id) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await apiRequest(`/api/safety/contacts/${id}/`, { method: "DELETE" });
      await refreshSafetyData();
      setMessage("Emergency contact removed.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function triggerSos() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      await apiRequest("/api/safety/sos/", {
        method: "POST",
        body: JSON.stringify({
          latitude: Number(position.latitude.toFixed(8)),
          longitude: Number(position.longitude.toFixed(8)),
        }),
      });
      await refreshSafetyData();
      setMessage("SOS event recorded with your location.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function findNearbyHelp() {
    setError("");
    setNearbyPoints([]);
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      const result = await apiRequest("/api/maps/safety-points/", {
        method: "POST",
        body: JSON.stringify({
          latitude: position.latitude,
          longitude: position.longitude,
          radius_km: 5,
          categories: ["POLICE", "HOSPITAL"],
        }),
      });
      if (!Array.isArray(result.safety_points)) {
        throw new Error("The safety service returned an unexpected response.");
      }
      setNearbyPoints(result.safety_points);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function resolveSos(id) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await apiRequest(`/api/safety/sos/${id}/resolve/`, { method: "POST" });
      await refreshSafetyData();
      setMessage("SOS event marked as resolved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

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

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {loading && <p role="status">Loading your safety information...</p>}

        <section className="safety-grid">
          <div className="safety-card">
            <div>🚨</div>
            <h3>Emergency Contacts</h3>
            <p>Manage your personal emergency contacts.</p>
          </div>
          <div className="safety-card">
            <div>📍</div>
            <h3>Safe Areas</h3>
            <p>Find nearby police stations and hospitals.</p>
            <button type="button" disabled={busy} onClick={findNearbyHelp}>
              Find Nearby Help
            </button>
          </div>
          <div className="safety-card">
            <div>🕐</div>
            <h3>Travel Tips</h3>
            <p>Useful precautions and practical safety guidance.</p>
          </div>
          <div className="safety-card">
            <div>🏥</div>
            <h3>Nearby Help</h3>
            <p>Location results from police and hospital listings.</p>
          </div>
        </section>

        {nearbyPoints.length > 0 && (
          <section className="settings-card" aria-live="polite">
            <h2>Nearby Safety Points</h2>
            <ul>
              {nearbyPoints.map((point) => (
                <li key={`${point.category}-${point.name}-${point.latitude}-${point.longitude}`}>
                  {point.name} — {point.category}, {point.distance_km} km
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="settings-card">
          <h2>Emergency Contacts</h2>
          {contacts.length === 0 && <p>No emergency contacts added.</p>}
          <ul>
            {contacts.map((savedContact) => (
              <li key={savedContact.id}>
                {savedContact.name} — {savedContact.phone}
                {savedContact.relationship ? ` (${savedContact.relationship})` : ""}
                {savedContact.is_primary ? " • Primary" : ""}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => deleteContact(savedContact.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={addContact}>
            <div className="form-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                required
                maxLength="100"
                value={contact.name}
                onChange={(event) => setContact({ ...contact, name: event.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="contact-phone">Phone (digits only)</label>
              <input
                id="contact-phone"
                type="tel"
                required
                minLength="10"
                maxLength="15"
                pattern="[0-9]{10,15}"
                value={contact.phone}
                onChange={(event) => setContact({ ...contact, phone: event.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="contact-relationship">Relationship</label>
              <input
                id="contact-relationship"
                maxLength="50"
                value={contact.relationship}
                onChange={(event) => setContact({ ...contact, relationship: event.target.value })}
              />
            </div>
            <label>
              <input
                type="checkbox"
                checked={contact.is_primary}
                onChange={(event) => setContact({ ...contact, is_primary: event.target.checked })}
              />
              Primary contact
            </label>
            <button className="primary-button" type="submit" disabled={busy}>
              Add Emergency Contact
            </button>
          </form>
        </section>

        <section className="sos-preview-card">
          <div>
            <span>EMERGENCY FEATURE</span>
            <h2>SOS Assistance</h2>
            <p>Record an SOS event with your current location.</p>
          </div>
          <button type="button" disabled={busy} onClick={triggerSos}>
            {busy ? "Please wait..." : "Send SOS"}
          </button>
        </section>

        <section className="settings-card">
          <h2>SOS History</h2>
          {events.length === 0 && <p>No SOS events recorded.</p>}
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                {event.status} — {new Date(event.triggered_at).toLocaleString()}
                {event.status === "ACTIVE" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => resolveSos(event.id)}
                  >
                    Mark Resolved
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default WomenSafe;
