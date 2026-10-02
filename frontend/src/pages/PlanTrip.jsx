import { useState } from "react";
import Sidebar from "../components/Sidebar";
import mountainBg from "../assets/mountain-bg.png";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";

function PlanTrip() {
    const navigate = useNavigate();

    // -----------------------------
    // BASIC TRIP INFORMATION
    // -----------------------------
    const [destination, setDestination] = useState("Uttarakhand");
    const [travelers, setTravelers] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [source, setSource] = useState("");
    const [tripTitle, setTripTitle] = useState("");

    // -----------------------------
    // SAVE TRIP
    // -----------------------------
    const [isSavingTrip, setIsSavingTrip] = useState(false);
    const [tripSaved, setTripSaved] = useState(false);
    const [savedTrip, setSavedTrip] = useState(null);

    // -----------------------------
    // BUDGET PREFERENCE
    // -----------------------------
    const [budgetPreference, setBudgetPreference] =
        useState("moderate");

    // -----------------------------
    // INTERESTS
    // -----------------------------
    const [interests, setInterests] = useState(["nature"]);

    // -----------------------------
    // PREFERRED PLACES
    // -----------------------------
    const [preferredPlaces, setPreferredPlaces] =
        useState([]);

    const [placeInput, setPlaceInput] = useState("");

    // -----------------------------
    // BUDGET ESTIMATE
    // -----------------------------
    const [budgetEstimate, setBudgetEstimate] =
        useState(null);

    const [selectedBudget, setSelectedBudget] =
        useState(null);

    const [isEstimating, setIsEstimating] =
        useState(false);

    // -----------------------------
    // ITINERARY
    // -----------------------------
    const [itinerary, setItinerary] = useState(null);

    const [isGenerating, setIsGenerating] =
        useState(false);

    // -----------------------------
    // ERROR
    // -----------------------------
    const [error, setError] = useState("");

    // -----------------------------
    // INTEREST OPTIONS
    // -----------------------------
    const availableInterests = [
        ["nature", "Nature"],
        ["adventure", "Adventure"],
        ["heritage", "Heritage"],
        ["food", "Food"],
        ["spirituality", "Spiritual"],
        ["shopping", "Shopping"],
        ["photography", "Photography"],
        ["wildlife", "Wildlife"],
    ];

    // -----------------------------
    // CALCULATE NUMBER OF DAYS
    // -----------------------------
    const calculateDays = () => {
        if (!startDate || !endDate) {
            return 0;
        }

        const start = new Date(
            `${startDate}T00:00:00`
        );

        const end = new Date(
            `${endDate}T00:00:00`
        );

        const difference = end - start;

        return (
            Math.ceil(
                difference /
                    (1000 * 60 * 60 * 24)
            ) + 1
        );
    };

    // -----------------------------
    // TRAVEL STYLE FOR ITINERARY
    // -----------------------------
    const getTravelStyle = () => {
        if (travelers === 1) {
            return "solo";
        }

        if (travelers === 2) {
            return "couple";
        }

        if (travelers <= 4) {
            return "friends";
        }

        return "group";
    };

    // -----------------------------
    // TOGGLE INTEREST
    // -----------------------------
    const toggleInterest = (interest) => {
        setInterests((current) => {
            if (current.includes(interest)) {
                return current.filter(
                    (item) => item !== interest
                );
            }

            if (current.length >= 5) {
                return current;
            }

            return [...current, interest];
        });

        // New selection invalidates previous
        // budget estimate and itinerary
        setBudgetEstimate(null);
        setSelectedBudget(null);
        setItinerary(null);
        setTripSaved(false);
        setSavedTrip(null);
    };

    // -----------------------------
    // ADD PREFERRED PLACE
    // -----------------------------
    const addPreferredPlace = () => {
        const place = placeInput.trim();

        if (!place) {
            return;
        }

        const alreadyExists =
            preferredPlaces.some(
                (existing) =>
                    existing.toLowerCase() ===
                    place.toLowerCase()
            );

        if (!alreadyExists) {
            setPreferredPlaces((current) => [
                ...current,
                place,
            ]);
        }

        setPlaceInput("");

        // New place can affect budget/itinerary
        setBudgetEstimate(null);
        setSelectedBudget(null);
        setItinerary(null);
        setTripSaved(false);
        setSavedTrip(null);
    };

    // -----------------------------
    // REMOVE PREFERRED PLACE
    // -----------------------------
    const removePreferredPlace = (place) => {
        setPreferredPlaces((current) =>
            current.filter(
                (item) => item !== place
            )
        );

        setBudgetEstimate(null);
        setSelectedBudget(null);
        setItinerary(null);
        setTripSaved(false);
        setSavedTrip(null);
    };

    // -----------------------------
    // BUDGET PREFERENCE CHANGE
    // -----------------------------
    const handleBudgetPreferenceChange = (
        value
    ) => {
        setBudgetPreference(value);

        setBudgetEstimate(null);
        setSelectedBudget(null);
        setItinerary(null);
        setTripSaved(false);
        setSavedTrip(null);
    };

    // -----------------------------
    // ESTIMATE BUDGET
    // -----------------------------
    const estimateBudget = async () => {
        setError("");
        setBudgetEstimate(null);
        setSelectedBudget(null);
        setItinerary(null);
        setTripSaved(false);
        setSavedTrip(null);

        const days = calculateDays();

        if (!destination) {
            setError(
                "Please select a destination."
            );
            return;
        }

        if (!startDate || !endDate) {
            setError(
                "Please select both start and end dates."
            );
            return;
        }

        if (days < 1) {
            setError(
                "End date must be on or after start date."
            );
            return;
        }

        if (days > 30) {
            setError(
                "Trip duration cannot exceed 30 days."
            );
            return;
        }

        if (interests.length === 0) {
            setError(
                "Please select at least one interest."
            );
            return;
        }

        setIsEstimating(true);

        try {
            /*
             * Frontend label → backend budget category
             *
             * Budget    → budget
             * Moderate  → moderate
             * Premium   → luxury
             */

            const backendBudgetStyle =
                budgetPreference === "premium"
                    ? "luxury"
                    : budgetPreference;

            const data = await apiRequest(
                "/api/ai/budget/estimate/",
                {
                    method: "POST",

                    body: JSON.stringify({
                        destination,
                        days,
                        travellers: travelers,
                        travel_style:
                            backendBudgetStyle,
                        travel_pace: "comfortable",
                        interests,
                        transport_preference:
                            "not specified",
                    }),
                }
            );

            setBudgetEstimate(data);

            // Default to AI estimated amount
            setSelectedBudget(
                data.estimated_total
            );

        } catch (err) {
            setError(
                err.message ||
                    "Unable to estimate the trip budget."
            );
        } finally {
            setIsEstimating(false);
        }
    };

    // -----------------------------
    // GENERATE ITINERARY
    // -----------------------------
    const generateItinerary = async () => {
        setError("");

        if (!budgetEstimate) {
            setError(
                "Please estimate your budget before generating the itinerary."
            );
            return;
        }

        if (!selectedBudget) {
            setError(
                "Please select a budget for your itinerary."
            );
            return;
        }

        const days = calculateDays();

        setIsGenerating(true);

        try {
            const data = await apiRequest(
                "/api/ai/itinerary/generate/",
                {
                    method: "POST",

                    body: JSON.stringify({
                        destination,
                        days,
                        budget: selectedBudget,
                        interests,
                        travel_style:
                            getTravelStyle(),
                        travel_pace: "moderate",
                        preferred_places:
                            preferredPlaces,
                    }),
                }
            );

            setItinerary(data.itinerary);

            // New itinerary has not been saved yet
            setTripSaved(false);
            setSavedTrip(null);

        } catch (err) {
            setError(
                err.message ||
                    "Unable to generate itinerary."
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // -----------------------------
    // SAVE TRIP
    // -----------------------------
    const handleSaveTrip = async () => {
        setError("");

        if (!itinerary) {
            setError(
                "Please generate an itinerary first."
            );
            return;
        }

        if (!selectedBudget) {
            setError(
                "Please select a budget first."
            );
            return;
        }

        if (!startDate || !endDate) {
            setError(
                "Please select your trip dates."
            );
            return;
        }

        setIsSavingTrip(true);
        setTripSaved(false);

        try {
            const data = await apiRequest(
                "/api/trips/",
                {
                    method: "POST",

                    body: JSON.stringify({
                        title:
                            tripTitle.trim() ||
                            `${destination} Trip`,

                        source: source.trim(),

                        destination,

                        preferred_places:
                            preferredPlaces,

                        start_date: startDate,

                        end_date: endDate,

                        budget: selectedBudget,
                    }),
                }
            );

            console.log(
                "Trip saved successfully:",
                data
            );

            setSavedTrip(data);
            setTripSaved(true);

            // Redirect to My Trips
            navigate("/my-trips");

        } catch (err) {
            console.error(
                "Save trip error:",
                err
            );

            setError(
                err.message ||
                    "Unable to save your trip."
            );
        } finally {
            setIsSavingTrip(false);
        }
    };

    // -----------------------------
    // FORMAT RUPEES
    // -----------------------------
    const formatCurrency = (amount) => {
        if (
            amount === undefined ||
            amount === null
        ) {
            return "₹0";
        }

        return `₹${Number(
            amount
        ).toLocaleString("en-IN")}`;
    };

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="app-main">

                {/* ================= HEADER ================= */}

                <header className="app-topbar">

                    <div>

                        <h1>
                            Plan Your Journey
                        </h1>

                        <p>
                            Create a personalized trip
                            with MusafirAI.
                        </p>

                    </div>

                </header>

                {/* ================= MAIN PLANNER ================= */}

                <div className="plan-layout">

                    {/* ================= FORM ================= */}

                    <section className="plan-form-card">

                        <div className="page-card-heading">

                            <span>
                                START PLANNING
                            </span>

                            <h2>
                                Plan Your Journey
                            </h2>

                            <p>
                                Tell us about your trip and
                                MusafirAI will create a
                                personalized itinerary.
                            </p>

                        </div>

                        {/* DESTINATION + TRAVELERS */}

                        <div className="form-row">

                            <div className="form-field">

                                <label>
                                    Destination
                                </label>

                                <select
                                    value={destination}
                                    onChange={(e) => {
                                        setDestination(
                                            e.target.value
                                        );

                                        setBudgetEstimate(
                                            null
                                        );

                                        setSelectedBudget(
                                            null
                                        );

                                        setItinerary(
                                            null
                                        );

                                        setTripSaved(
                                            false
                                        );

                                        setSavedTrip(
                                            null
                                        );
                                    }}
                                >

                                    <option value="Uttarakhand">
                                        Uttarakhand
                                    </option>

                                    <option value="Manali">
                                        Manali
                                    </option>

                                    <option value="Jaipur">
                                        Jaipur
                                    </option>

                                    <option value="Rishikesh">
                                        Rishikesh
                                    </option>

                                    <option value="Nainital">
                                        Nainital
                                    </option>

                                    <option value="Dehradun">
                                        Dehradun
                                    </option>

                                </select>

                            </div>

                            <div className="form-field">

                                <label>
                                    Travelers
                                </label>

                                <select
                                    value={travelers}
                                    onChange={(e) => {
                                        setTravelers(
                                            Number(
                                                e.target.value
                                            )
                                        );

                                        setBudgetEstimate(
                                            null
                                        );

                                        setSelectedBudget(
                                            null
                                        );

                                        setItinerary(
                                            null
                                        );

                                        setTripSaved(
                                            false
                                        );

                                        setSavedTrip(
                                            null
                                        );
                                    }}
                                >

                                    <option value={1}>
                                        1 Traveler
                                    </option>

                                    <option value={2}>
                                        2 Travelers
                                    </option>

                                    <option value={3}>
                                        3 Travelers
                                    </option>

                                    <option value={4}>
                                        4 Travelers
                                    </option>

                                    <option value={5}>
                                        5 Travelers
                                    </option>

                                    <option value={6}>
                                        6+ Travelers
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* DATES */}

                        <div className="form-row">

                            <div className="form-field">

                                <label>
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(
                                            e.target.value
                                        );

                                        setBudgetEstimate(
                                            null
                                        );

                                        setSelectedBudget(
                                            null
                                        );

                                        setItinerary(
                                            null
                                        );

                                        setTripSaved(
                                            false
                                        );

                                        setSavedTrip(
                                            null
                                        );
                                    }}
                                />

                            </div>

                            <div className="form-field">

                                <label>
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    min={
                                        startDate ||
                                        undefined
                                    }
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(
                                            e.target.value
                                        );

                                        setBudgetEstimate(
                                            null
                                        );

                                        setSelectedBudget(
                                            null
                                        );

                                        setItinerary(
                                            null
                                        );

                                        setTripSaved(
                                            false
                                        );

                                        setSavedTrip(
                                            null
                                        );
                                    }}
                                />

                            </div>

                        </div>

                        {/* TRIP DAYS */}

                        {calculateDays() > 0 && (

                            <div className="trip-days-info">

                                Trip duration:{" "}

                                <strong>

                                    {calculateDays()} day
                                    {calculateDays() !== 1
                                        ? "s"
                                        : ""}

                                </strong>

                            </div>

                        )}

                        {/* BUDGET PREFERENCE */}

                        <div className="form-field">

                            <label>
                                Budget Preference
                            </label>

                            <div className="choice-grid">

                                <button
                                    type="button"
                                    className={
                                        budgetPreference ===
                                        "budget"
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        handleBudgetPreferenceChange(
                                            "budget"
                                        )
                                    }
                                >
                                    Budget
                                </button>

                                <button
                                    type="button"
                                    className={
                                        budgetPreference ===
                                        "moderate"
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        handleBudgetPreferenceChange(
                                            "moderate"
                                        )
                                    }
                                >
                                    Moderate
                                </button>

                                <button
                                    type="button"
                                    className={
                                        budgetPreference ===
                                        "premium"
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        handleBudgetPreferenceChange(
                                            "premium"
                                        )
                                    }
                                >
                                    Premium
                                </button>

                            </div>

                        </div>

                        {/* INTERESTS */}

                        <div className="form-field">

                            <label>
                                Interests
                            </label>

                            <div className="choice-grid">

                                {availableInterests.map(
                                    ([value, label]) => (

                                        <button
                                            type="button"
                                            key={value}
                                            className={
                                                interests.includes(
                                                    value
                                                )
                                                    ? "selected"
                                                    : ""
                                            }
                                            onClick={() =>
                                                toggleInterest(
                                                    value
                                                )
                                            }
                                        >
                                            {label}
                                        </button>

                                    )
                                )}

                            </div>

                            <small>
                                Select up to 5 interests.
                            </small>

                        </div>

                        {/* PREFERRED PLACES */}

                        <div className="form-field">

                            <label>
                                Preferred Places
                            </label>

                            <div className="preferred-place-input">

                                <input
                                    type="text"
                                    placeholder="e.g. Robber's Cave"
                                    value={placeInput}
                                    onChange={(e) =>
                                        setPlaceInput(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {

                                        if (
                                            e.key ===
                                            "Enter"
                                        ) {
                                            e.preventDefault();

                                            addPreferredPlace();
                                        }

                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={
                                        addPreferredPlace
                                    }
                                >
                                    Add
                                </button>

                            </div>

                            {preferredPlaces.length > 0 && (

                                <div className="preferred-place-list">

                                    {preferredPlaces.map(
                                        (place) => (

                                            <span
                                                className="place-tag"
                                                key={place}
                                            >

                                                {place}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePreferredPlace(
                                                            place
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                            </span>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                        {/* ERROR */}

                        {error && (

                            <div className="form-error">
                                {error}
                            </div>

                        )}

                        {/* BUDGET BUTTON */}

                        <button
                            type="button"
                            className="generate-button"
                            onClick={estimateBudget}
                            disabled={isEstimating}
                        >

                            {isEstimating
                                ? "Estimating Budget..."
                                : "₹ Estimate My Budget"}

                        </button>

                        {/* ================= BUDGET RESULT ================= */}

                        {budgetEstimate && (

                            <div className="budget-estimate-card">

                                <div>

                                    <span>
                                        AI BUDGET ESTIMATE
                                    </span>

                                    <h3>
                                        Your Estimated
                                        Travel Budget
                                    </h3>

                                </div>

                                <div className="budget-options">

                                    {/* MINIMUM */}

                                    <button
                                        type="button"
                                        className={
                                            selectedBudget ===
                                            budgetEstimate.minimum_budget
                                                ? "budget-option selected"
                                                : "budget-option"
                                        }
                                        onClick={() =>
                                            setSelectedBudget(
                                                budgetEstimate.minimum_budget
                                            )
                                        }
                                    >

                                        <span>
                                            Minimum
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                budgetEstimate.minimum_budget
                                            )}
                                        </strong>

                                        <small>
                                            Basic travel
                                        </small>

                                    </button>

                                    {/* ESTIMATED */}

                                    <button
                                        type="button"
                                        className={
                                            selectedBudget ===
                                            budgetEstimate.estimated_total
                                                ? "budget-option selected"
                                                : "budget-option"
                                        }
                                        onClick={() =>
                                            setSelectedBudget(
                                                budgetEstimate.estimated_total
                                            )
                                        }
                                    >

                                        <span>
                                            Estimated
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                budgetEstimate.estimated_total
                                            )}
                                        </strong>

                                        <small>
                                            AI recommended estimate
                                        </small>

                                    </button>

                                    {/* MAXIMUM */}

                                    <button
                                        type="button"
                                        className={
                                            selectedBudget ===
                                            budgetEstimate.maximum_budget
                                                ? "budget-option selected"
                                                : "budget-option"
                                        }
                                        onClick={() =>
                                            setSelectedBudget(
                                                budgetEstimate.maximum_budget
                                            )
                                        }
                                    >

                                        <span>
                                            Maximum
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                budgetEstimate.maximum_budget
                                            )}
                                        </strong>

                                        <small>
                                            Extra flexibility
                                        </small>

                                    </button>

                                </div>

                                <p className="budget-confirmation">

                                    Selected trip budget:{" "}

                                    <strong>
                                        {formatCurrency(
                                            selectedBudget
                                        )}
                                    </strong>

                                </p>

                            </div>

                        )}

                        {/* GENERATE ITINERARY */}

                        {budgetEstimate && (

                            <button
                                type="button"
                                className="generate-button itinerary-button"
                                onClick={
                                    generateItinerary
                                }
                                disabled={
                                    isGenerating
                                }
                            >

                                {isGenerating
                                    ? "Creating Your Itinerary..."
                                    : "✦ Generate My Itinerary"}

                            </button>

                        )}

                    </section>

                    {/* ================= PREVIEW ================= */}

                    <div className="plan-preview">

                        <div className="preview-image">

                            <img
                                src={mountainBg}
                                alt="Travel destination"
                            />

                        </div>

                        <div className="preview-overlay">

                            <span>
                                YOUR DESTINATION
                            </span>

                            <h2>
                                {destination}
                            </h2>

                            <p>

                                {interests.length > 0
                                    ? interests
                                          .map(
                                              (interest) =>
                                                  interest
                                                      .charAt(
                                                          0
                                                      )
                                                      .toUpperCase() +
                                                  interest.slice(
                                                      1
                                                  )
                                          )
                                          .join(
                                              " • "
                                          )
                                    : "Discover • Explore • Experience"}

                            </p>

                        </div>

                    </div>

                </div>

                {/* ================= ITINERARY ================= */}

                {itinerary && (

                    <section className="generated-itinerary">

                        <div className="page-card-heading">

                            <span>
                                YOUR AI ITINERARY
                            </span>

                            <h2>
                                {destination}
                            </h2>

                            <p>

                                Personalized for{" "}

                                {travelers} traveler
                                {travelers !== 1
                                    ? "s"
                                    : ""}{" "}

                                •{" "}

                                {calculateDays()} days

                                •{" "}

                                {formatCurrency(
                                    selectedBudget
                                )}

                            </p>

                        </div>

                        {itinerary.map(
                            (day, index) => (

                                <div
                                    className="itinerary-day"
                                    key={`day-${index}`}
                                >

                                    <div className="itinerary-day-header">

                                        <h3>
                                            Day{" "}
                                            {day.day ||
                                                index + 1}
                                        </h3>

                                        <span>
                                            {formatCurrency(
                                                day.estimated_day_cost
                                            )}
                                        </span>

                                    </div>

                                    <div className="itinerary-places">

                                        {day.places?.map(
                                            (
                                                place,
                                                placeIndex
                                            ) => (

                                                <div
                                                    className="itinerary-place"
                                                    key={`${place.name}-${placeIndex}`}
                                                >

                                                    <div>

                                                        <h4>
                                                            {
                                                                place.name
                                                            }
                                                        </h4>

                                                        {place.description && (

                                                            <p>
                                                                {
                                                                    place.description
                                                                }
                                                            </p>

                                                        )}

                                                    </div>

                                                    <strong>
                                                        {formatCurrency(
                                                            place.estimated_cost
                                                        )}
                                                    </strong>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )
                        )}

                        {/* ================= SAVE TRIP ================= */}

                        <button
                            type="button"
                            className="generate-button"
                            onClick={
                                handleSaveTrip
                            }
                            disabled={
                                isSavingTrip
                            }
                        >

                            {isSavingTrip
                                ? "Saving Trip..."
                                : "✓ Save Trip"}

                        </button>

                    </section>

                )}

            </main>

        </div>
    );
}

export default PlanTrip;