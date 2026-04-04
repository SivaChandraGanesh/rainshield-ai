# 🌧️ RainShield AI — Frontend

React-based frontend for RainShield AI, a parametric insurance platform for gig delivery workers.

## Tech Stack

- **React 19** + **Vite** (fast dev server with HMR)
- **React Router** for client-side routing
- **Vanilla CSS** (mobile-first, Inter font, blue/white palette)

## Getting Started

```powershell
# 1. Navigate to frontend folder
cd e:\downloads1\rainshield-ai-main\rainshield-ai-main\frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```

App opens at **http://localhost:5173**

> **Note:** The backend (Express on port 3000) is optional — the app uses fallback data when the API is unavailable.

## Project Structure

```
frontend/
├── index.html              # Vite entry point
├── vite.config.js          # Dev server + API proxy config
├── public/
│   └── hero.png            # Hero image asset
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Router + Context provider
    ├── index.css           # All styles
    ├── context/
    │   └── AppContext.jsx  # Global state (user, plan, weather, claim)
    ├── services/
    │   └── api.js          # REST API calls (/register, /weather, /check-claim, /ai-risk)
    ├── utils/
    │   └── utils.js        # Plan definitions, risk logic, formatCurrency
    ├── components/
    │   ├── BottomNav.jsx   # Shared bottom navigation
    │   ├── TopBar.jsx      # Shared top bar with logo
    │   └── Toast.jsx       # Toast notification
    └── pages/
        ├── LoginPage.jsx       # Registration + login
        ├── DashboardPage.jsx   # Plan card, risk, weather, activity
        ├── InsurancePage.jsx   # Plan selection + activate
        ├── ClaimsPage.jsx      # Payout card + timeline
        └── ProfilePage.jsx     # User info + logout
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Login | Registration form with city-based risk assessment |
| `/dashboard` | Dashboard | Active plan, real-time risk, weather data |
| `/insurance` | Insurance | 3 plan tiers (Low/Medium/High) |
| `/claims` | Claims | Payout status + event detection timeline |
| `/profile` | Profile | Account details + logout |

## API Proxy

Vite proxies `/api/*` requests to `http://localhost:3000` (backend). For example:
- `fetch('/api/weather')` → `http://localhost:3000/weather`
- `fetch('/api/register')` → `http://localhost:3000/register`

## Build for Production

```bash
npm run build    # Output in dist/
npm run preview  # Preview production build locally
```
