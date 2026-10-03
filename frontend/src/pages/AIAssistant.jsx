import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { apiRequest } from "../api/api";

const SUGGESTIONS = [
  "Plan a trip to Uttarakhand",
  "What should I visit in Jaipur?",
  "Give me travel safety tips",
];

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your MusafirAI assistant. Ask me about destinations, itineraries, travel tips, culture or activities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question) {
    const message = question.trim();
    if (!message || loading) return;

    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await apiRequest("/api/ai/assistant/", {
        method: "POST",
        body: JSON.stringify({
          message,
          conversation: messages.slice(-10).map(({ role, content }) => ({
            role,
            content: content.slice(0, 2000),
          })),
        }),
      });
      if (typeof response.answer !== "string" || !response.answer.trim()) {
        throw new Error("The assistant returned an empty response.");
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer },
      ]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    ask(input);
  }

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
            <div className="assistant-icon">✦</div>
            <h2>Hi! I'm your MusafirAI assistant.</h2>
            <p>
              Ask me about destinations, itineraries,
              travel tips, culture or activities.
            </p>

            <div aria-live="polite">
              {messages.map((item, index) => (
                <p key={`${item.role}-${index}`}>
                  <strong>{item.role === "user" ? "You" : "MusafirAI"}:</strong>{" "}
                  {item.content}
                </p>
              ))}
              {loading && <p role="status">MusafirAI is thinking...</p>}
            </div>

            {error && <p role="alert">{error}</p>}

            <div className="assistant-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => ask(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form className="assistant-input" onSubmit={handleSubmit}>
              <input
                type="text"
                required
                maxLength="2000"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask your travel question..."
                aria-label="Ask your travel question"
              />
              <button type="submit" aria-label="Send question" disabled={loading}>
                →
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AIAssistant;
