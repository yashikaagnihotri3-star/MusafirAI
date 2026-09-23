# MusafirAI


## 🎨 Frontend — React

The MusafirAI frontend is developed using **React.js** and follows a modular component-based architecture.

```text
frontend/
│
├── public/
│   └── assets/
│       └── ...
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── ...
│   │   │
│   │   ├── icons/
│   │   │   ├── ...
│   │   │
│   │   └── fonts/
│   │
│   ├── components/
│   │   │
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── AuthLayout.jsx
│   │   │
│   │   ├── trip/
│   │   │   ├── TripForm.jsx
│   │   │   ├── TripCard.jsx
│   │   │   ├── TripSummary.jsx
│   │   │   ├── TripHistory.jsx
│   │   │   └── TripPreferences.jsx
│   │   │
│   │   ├── itinerary/
│   │   │   ├── ItineraryCard.jsx
│   │   │   ├── DayPlan.jsx
│   │   │   ├── PlaceCard.jsx
│   │   │   ├── BudgetSummary.jsx
│   │   │   └── ItineraryActions.jsx
│   │   │
│   │   ├── map/
│   │   │   ├── TravelMap.jsx
│   │   │   ├── MapMarker.jsx
│   │   │   ├── RoutePanel.jsx
│   │   │   ├── LocationInfo.jsx
│   │   │   └── MapControls.jsx
│   │   │
│   │   ├── safety/
│   │   │   ├── SafetyScore.jsx
│   │   │   ├── RiskArea.jsx
│   │   │   ├── EmergencyContacts.jsx
│   │   │   ├── SOSButton.jsx
│   │   │   └── SafetyTips.jsx
│   │   │
│   │   ├── heritage/
│   │   │   ├── HeritageCard.jsx
│   │   │   ├── HeritageDetails.jsx
│   │   │   ├── CulturalInfo.jsx
│   │   │   ├── LocalTips.jsx
│   │   │   └── HeritageChat.jsx
│   │   │
│   │   ├── reroute/
│   │   │   ├── RerouteAlert.jsx
│   │   │   ├── AlternativeRoute.jsx
│   │   │   └── UpdatedItinerary.jsx
│   │   │
│   │   └── weather/
│   │       ├── WeatherCard.jsx
│   │       ├── WeatherAlert.jsx
│   │       └── WeatherForecast.jsx
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PlanTrip.jsx
│   │   ├── Itinerary.jsx
│   │   ├── ExploreMap.jsx
│   │   ├── Safety.jsx
│   │   ├── Heritage.jsx
│   │   ├── MyTrips.jsx
│   │   ├── TripDetails.jsx
│   │   ├── Profile.jsx
│   │   └── NotFound.jsx
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── tripService.js
│   │   ├── itineraryService.js
│   │   ├── mapService.js
│   │   ├── safetyService.js
│   │   ├── heritageService.js
│   │   ├── rerouteService.js
│   │   └── weatherService.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── TripContext.jsx
│   │   └── MapContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTrip.js
│   │   ├── useLocation.js
│   │   └── useApi.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatDate.js
│   │   ├── formatCurrency.js
│   │   ├── mapUtils.js
│   │   └── validation.js
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   ├── responsive.css
│   │   └── animations.css
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

### 📌 Frontend Module Responsibilities

| Folder                 | Responsibility                              |
| ---------------------- | ------------------------------------------- |
| `components/common`    | Reusable UI components                      |
| `components/auth`      | Login and signup components                 |
| `components/trip`      | Trip planning and trip management           |
| `components/itinerary` | AI-generated itinerary display              |
| `components/map`       | Interactive map and route visualization     |
| `components/safety`    | Safety score, emergency contacts and SOS UI |
| `components/heritage`  | Heritage and cultural information           |
| `components/reroute`   | Dynamic route/itinerary changes             |
| `components/weather`   | Weather information and alerts              |
| `pages`                | Complete application screens                |
| `layouts`              | Common page layouts                         |
| `services`             | Backend API communication                   |
| `context`              | Global application state                    |
| `hooks`                | Reusable React logic                        |
| `utils`                | Helper functions and constants              |
| `styles`               | Global and responsive styling               |
| `assets`               | Images, icons and other static resources    |

### 🔄 Frontend Data Flow

```text
                    React Frontend
                          │
          ┌───────────────┼────────────────┐
          │               │                │
        Pages         Components        Context
          │               │                │
          └───────────────┼────────────────┘
                          │
                       Services
                          │
                    REST API / JSON
                          │
                    Django Backend
                          │
          ┌───────────────┼────────────────┐
          │               │                │
       MySQL          AI Services       External APIs
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                           Maps        Weather      SOS
```
