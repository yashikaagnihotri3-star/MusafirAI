import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import PlanTrip from "./pages/PlanTrip";
import MyTrips from "./pages/MyTrips";
import SmartMap from "./pages/SmartMap";
import WomenSafe from "./pages/WomenSafe";
import HeritageGuide from "./pages/HeritageGuide";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/ProfileSettings";

import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* PROTECTED ROUTES */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/Dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/plan-trip"
            element={<PlanTrip />}
          />

          <Route
            path="/my-trips"
            element={<MyTrips />}
          />

          <Route
            path="/smart-map"
            element={<SmartMap />}
          />

          <Route
            path="/womensafe"
            element={<WomenSafe />}
          />

          <Route
            path="/heritage"
            element={<HeritageGuide />}
          />

          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;