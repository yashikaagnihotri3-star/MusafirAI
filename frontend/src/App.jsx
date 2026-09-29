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
import ProfileSettings from "./pages/ProfileSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Dashboard Pages */}
        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/smart-map" element={<SmartMap />} />
        <Route path="/womensafe" element={<WomenSafe />} />
        <Route path="/heritage" element={<HeritageGuide />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/settings" element={<ProfileSettings />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

