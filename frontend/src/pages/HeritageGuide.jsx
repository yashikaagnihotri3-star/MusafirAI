import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  Search,
  Landmark,
  BookOpen,
  Building2,
  Globe2,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  XCircle,
  MessageCircle,
  MapPin,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const GUIDE_API_URL = `${API_BASE_URL}/api/ai/heritage/`;
const QUESTION_API_URL = `${API_BASE_URL}/api/ai/heritage/ask/`;

function HeritageGuide() {
  const [place, setPlace] = useState("");
  const [guide, setGuide] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);

  const [error, setError] = useState("");

  const [loadingGuide, setLoadingGuide] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const [searchedPlace, setSearchedPlace] = useState("");

  /*
   * Common API request handler
   */
  const sendRequest = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";

    let data;

    /*
     * Handle JSON response
     */
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      /*
       * Handle HTML/non-JSON response
       */
      const text = await response.text();

      if (
        text.includes("<!DOCTYPE") ||
        text.includes("<html") ||
        text.includes("<!doctype")
      ) {
        throw new Error(
          "The backend returned an HTML page instead of JSON. Please check the API endpoint."
        );
      }

      throw new Error(
        `The server returned an unexpected response. Status: ${response.status}`
      );
    }

    console.log("API response:", data);

    /*
     * Handle backend errors
     */
    if (!response.ok) {
      let errorMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        "The backend could not process your request.";

      /*
       * Prevent [object Object]
       */
      if (typeof errorMessage === "object") {
        errorMessage =
          errorMessage?.message ||
          errorMessage?.detail ||
          errorMessage?.error ||
          JSON.stringify(errorMessage);
      }

      throw new Error(String(errorMessage));
    }

    return data;
  };

  /*
   * Search heritage place
   */
  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmedPlace = place.trim();

    if (!trimmedPlace) {
      setError(
        "Please enter a city, monument or heritage destination."
      );
      return;
    }

    setError("");
    setAnswer(null);
    setQuestion("");
    setGuide(null);
    setSearchedPlace(trimmedPlace);
    setLoadingGuide(true);

    try {
      const data = await sendRequest(GUIDE_API_URL, {
        place: trimmedPlace,
        question: `Give me a concise heritage guide for ${trimmedPlace}.`,
      });

      console.log("Heritage guide response:", data);

      setGuide(data);
    } catch (err) {
      console.error("Heritage guide error:", err);

      setError(
        err?.message ||
          "Unable to load heritage information. Please try again."
      );
    } finally {
      setLoadingGuide(false);
    }
  };

  /*
   * Ask question about current heritage place
   */
  const handleQuestion = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    if (!guide?.place) {
      setError("Please search for a place first.");
      return;
    }

    setError("");
    setAnswer(null);
    setLoadingAnswer(true);

    try {
      const data = await sendRequest(QUESTION_API_URL, {
        place: guide.place,
        question: trimmedQuestion,
      });

      console.log("Heritage question response:", data);

      setAnswer(data);
    } catch (err) {
      console.error("Heritage question error:", err);

      setError(
        err?.message ||
          "Unable to answer your question. Please try again."
      );
    } finally {
      setLoadingAnswer(false);
    }
  };

  /*
   * Reset complete heritage search
   */
  const resetSearch = () => {
    setPlace("");
    setGuide(null);
    setQuestion("");
    setAnswer(null);
    setError("");
    setSearchedPlace("");
  };

  /*
   * Popular search buttons
   */
  const selectPopularPlace = (value) => {
    setPlace(value);
    setError("");
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main heritage-main">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header className="app-topbar heritage-topbar">
          <div>
            <h1>Heritage Guide</h1>

            <p>
              Discover the history, architecture and culture behind
              the places you explore.
            </p>
          </div>
        </header>

        {/* =====================================================
            SEARCH SECTION
        ===================================================== */}

        <section className="heritage-search-card">

          <div className="heritage-card-heading">

            <div className="heritage-icon-box">
              <Search size={23} />
            </div>

            <div>
              <h2>Search a Place</h2>

              <p>
                Enter the name of a city, monument, historical site
                or heritage destination.
              </p>
            </div>

          </div>

          <form
            className="heritage-search-form"
            onSubmit={handleSearch}
          >

            <div className="heritage-input-wrapper">

              <MapPin size={20} />

              <input
                type="text"
                value={place}
                onChange={(event) =>
                  setPlace(event.target.value)
                }
                placeholder="Search city, monument or heritage place..."
                disabled={loadingGuide}
              />

            </div>

            <button
              type="submit"
              className="heritage-primary-btn"
              disabled={loadingGuide}
            >

              {loadingGuide ? (
                <>
                  <Loader2
                    size={18}
                    className="heritage-spin"
                  />

                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />

                  Search
                </>
              )}

            </button>

          </form>

          {/* ERROR */}
          {error && (
            <div className="heritage-validation">

              <XCircle size={17} />

              <span>{error}</span>

            </div>
          )}

          {/* POPULAR SEARCHES */}
          {!guide && !loadingGuide && (
            <div className="heritage-suggestions">

              <span>Popular searches</span>

              <button
                type="button"
                onClick={() =>
                  selectPopularPlace(
                    "Forest Research Institute"
                  )
                }
              >
                Forest Research Institute
              </button>

              <button
                type="button"
                onClick={() =>
                  selectPopularPlace("Taj Mahal")
                }
              >
                Taj Mahal
              </button>

              <button
                type="button"
                onClick={() =>
                  selectPopularPlace("Delhi")
                }
              >
                Delhi
              </button>

            </div>
          )}

        </section>

        {/* =====================================================
            LOADING STATE
        ===================================================== */}

        {loadingGuide && (
          <section className="heritage-welcome">

            <div className="heritage-welcome-art">

              <div className="heritage-art-circle">
                <Loader2
                  size={40}
                  className="heritage-spin"
                />
              </div>

            </div>

            <span className="heritage-eyebrow">
              MUSAFIRAI · HERITAGE
            </span>

            <h2>
              Discovering {searchedPlace}
            </h2>

            <p>
              Gathering the history, architecture and cultural
              information for this destination...
            </p>

          </section>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!guide && !loadingGuide && (
          <section className="heritage-welcome">

            <div className="heritage-welcome-art">

              <div className="heritage-art-circle">
                <Landmark size={40} />
              </div>

            </div>

            <span className="heritage-eyebrow">
              HISTORY · CULTURE · DISCOVERY
            </span>

            <h2>Start Exploring</h2>

            <p>
              Search for a city, monument or historical destination
              and let your heritage guide tell you its story.
            </p>

            <div className="heritage-feature-row">

              <div>
                <BookOpen size={19} />
                <span>Local history</span>
              </div>

              <div>
                <Building2 size={19} />
                <span>Architecture</span>
              </div>

              <div>
                <Globe2 size={19} />
                <span>Culture & traditions</span>
              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            HERITAGE RESULTS
        ===================================================== */}

        {guide && !loadingGuide && (
          <section className="heritage-results">

            {/* =================================================
                GUIDE INTRO
            ================================================= */}

            <div className="heritage-guide-hero">

              <div className="heritage-guide-hero-icon">
                <Landmark size={32} />
              </div>

              <div className="heritage-guide-hero-content">

                <span className="heritage-guide-label">
                  YOUR HERITAGE GUIDE
                </span>

                <h2>
                  Let's explore {guide.place}
                </h2>

                <p>
                  Come along — I'll show you what makes this place
                  interesting, important and worth remembering.
                </p>

              </div>

              <button
                type="button"
                className="heritage-secondary-btn"
                onClick={resetSearch}
              >
                <ArrowLeft size={16} />
                New Search
              </button>

            </div>

            {/* =================================================
                VERIFICATION NOTICE
            ================================================= */}

            {!guide.known && (
              <div className="heritage-validation">

                <XCircle size={17} />

                <span>
                  Some information about this destination could not
                  be confidently verified.
                </span>

              </div>
            )}

            {/* =================================================
                THE STORY
            ================================================= */}

            {(guide.history ||
              guide.cultural_significance) && (
              <section className="heritage-story-section">

                <div className="heritage-section-heading">

                  <div>

                    <span className="heritage-mini-label">
                      THE STORY
                    </span>

                    <h2>
                      A little history, a lot of character
                    </h2>

                    <p>
                      Here's the simple story behind this place.
                    </p>

                  </div>

                </div>

                <div className="heritage-story-card">

                  <div className="heritage-story-mark">
                    <BookOpen size={25} />
                  </div>

                  <div className="heritage-story-content">

                    {guide.history && (
                      <div className="heritage-story-part">

                        <h3>
                          Where it comes from
                        </h3>

                        <p>
                          {guide.history}
                        </p>

                      </div>
                    )}

                    {guide.cultural_significance && (
                      <div className="heritage-story-part">

                        <h3>
                          Why it matters
                        </h3>

                        <p>
                          {guide.cultural_significance}
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                ARCHITECTURE
            ================================================= */}

            {guide.architecture && (
              <section className="heritage-look-section">

                <div className="heritage-section-heading">

                  <div>

                    <span className="heritage-mini-label">
                      WHEN YOU VISIT
                    </span>

                    <h2>
                      Look a little closer
                    </h2>

                    <p>
                      There is more to this place than what you
                      see at first.
                    </p>

                  </div>

                </div>

                <div className="heritage-architecture-card">

                  <div className="heritage-architecture-icon">
                    <Building2 size={27} />
                  </div>

                  <div>

                    <h3>
                      Notice the architecture
                    </h3>

                    <p>
                      {guide.architecture}
                    </p>

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                IMPORTANT FACTS
            ================================================= */}

            {guide.important_facts?.length > 0 && (
              <section className="heritage-facts-section">

                <div className="heritage-section-heading">

                  <div>

                    <span className="heritage-mini-label">
                      GOOD TO KNOW
                    </span>

                    <h2>
                      Things worth remembering
                    </h2>

                    <p>
                      A few details that will make your visit
                      more meaningful.
                    </p>

                  </div>

                </div>

                <div className="heritage-facts-card">

                  {guide.important_facts.map(
                    (item, index) => (
                      <div
                        className="heritage-fact-row"
                        key={`fact-${index}`}
                      >

                        <div className="heritage-fact-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <p>
                          {item}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                OPTIONAL INFORMATION
            ================================================= */}

            {(guide.local_stories?.length > 0 ||
              guide.traditions?.length > 0 ||
              guide.local_tips?.length > 0) && (
              <section className="heritage-extra-section">

                <div className="heritage-section-heading">

                  <div>

                    <span className="heritage-mini-label">
                      FROM THE PLACE
                    </span>

                    <h2>
                      More to discover
                    </h2>

                    <p>
                      Small details that can make the experience
                      more memorable.
                    </p>

                  </div>

                </div>

                <div className="heritage-extra-grid">

                  {guide.local_stories?.length > 0 && (
                    <HeritageList
                      icon={
                        <Sparkles size={20} />
                      }
                      title="Local Stories"
                      items={guide.local_stories}
                    />
                  )}

                  {guide.traditions?.length > 0 && (
                    <HeritageList
                      icon={
                        <Globe2 size={20} />
                      }
                      title="Traditions"
                      items={guide.traditions}
                    />
                  )}

                  {guide.local_tips?.length > 0 && (
                    <HeritageList
                      icon={
                        <Lightbulb size={20} />
                      }
                      title="Local Tips"
                      items={guide.local_tips}
                    />
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                DOS AND DONTS
            ================================================= */}

            {(guide.dos?.length > 0 ||
              guide.donts?.length > 0) && (
              <section className="heritage-guidance-section">

                <div className="heritage-section-heading">

                  <div>

                    <span className="heritage-mini-label">
                      BE A THOUGHTFUL TRAVELLER
                    </span>

                    <h2>
                      A few things to keep in mind
                    </h2>

                    <p>
                      Simple reminders for a respectful visit.
                    </p>

                  </div>

                </div>

                <div className="heritage-guidance-grid">

                  {guide.dos?.length > 0 && (
                    <HeritageGuidance
                      title="Good things to do"
                      items={guide.dos}
                      positive
                    />
                  )}

                  {guide.donts?.length > 0 && (
                    <HeritageGuidance
                      title="Things to avoid"
                      items={guide.donts}
                    />
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                ASK YOUR GUIDE
            ================================================= */}

            <section className="heritage-qa-card">

              <div className="heritage-qa-heading">

                <div className="heritage-qa-symbol">
                  <MessageCircle size={22} />
                </div>

                <div>

                  <span className="heritage-mini-label">
                    CURIOUS ABOUT SOMETHING?
                  </span>

                  <h2>
                    Ask your guide
                  </h2>

                  <p>
                    Still wondering about something at{" "}
                    {guide.place}? Ask me about its history,
                    culture or architecture.
                  </p>

                </div>

              </div>

              <form
                className="heritage-qa-form"
                onSubmit={handleQuestion}
              >

                <input
                  type="text"
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  placeholder="Ask something about this place..."
                  disabled={loadingAnswer}
                />

                <button
                  type="submit"
                  className="heritage-primary-btn"
                  disabled={loadingAnswer}
                >

                  {loadingAnswer ? (
                    <>
                      <Loader2
                        size={17}
                        className="heritage-spin"
                      />

                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />

                      Ask Guide
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  ANSWER
              ================================================= */}

              {answer && (
                <div className="heritage-answer-box">

                  <div className="heritage-answer-heading">

                    <Sparkles size={18} />

                    <strong>
                      Your guide says
                    </strong>

                    <span>
                      {answer.known
                        ? "Verified response"
                        : "AI response"}
                    </span>

                  </div>

                  <p>
                    {typeof answer.answer === "string"
                      ? answer.answer
                      : answer.answer
                      ? JSON.stringify(answer.answer)
                      : "I couldn't find an answer for that question."}
                  </p>

                </div>
              )}

            </section>

          </section>
        )}

      </main>
    </div>
  );
}

/* =========================================================
   HERITAGE LIST
   ========================================================= */

function HeritageList({
  icon,
  title,
  items = [],
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <article className="heritage-detail-card">

      <div className="heritage-detail-heading">

        <div className="heritage-detail-icon">
          {icon}
        </div>

        <h3>
          {title}
        </h3>

      </div>

      <ul>
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
          >
            {item}
          </li>
        ))}
      </ul>

    </article>
  );
}

/* =========================================================
   HERITAGE GUIDANCE
   ========================================================= */

function HeritageGuidance({
  title,
  items = [],
  positive = false,
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <article
      className={`heritage-guidance-card ${
        positive
          ? "heritage-positive"
          : "heritage-negative"
      }`}
    >

      <div className="heritage-guidance-heading">

        {positive ? (
          <CheckCircle2 size={21} />
        ) : (
          <XCircle size={21} />
        )}

        <h3>
          {title}
        </h3>

      </div>

      <ul>

        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
          >
            {item}
          </li>
        ))}

      </ul>

    </article>
  );
}

export default HeritageGuide;