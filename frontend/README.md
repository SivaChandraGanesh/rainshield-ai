# RainShield AI — Frontend

> Run this in **Terminal 2** (after Terminal 1 backend is running)

---

## Terminal 2 — Commands (in order)

```powershell
# 1. Navigate to frontend folder
cd c:\rainshield-ai\frontend

# 2. Start the frontend static server (allowing scripts to run)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npx --yes http-server . -a localhost -p 5500 --cors
```

✅ Frontend opens at → **http://localhost:5500**  
✅ Keep this terminal open and running

> ⚠️ Make sure **Terminal 1 (backend)** is already running before opening the browser.

---

## Both Terminals Together

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 — Backend                   │
│  cd c:\rainshield-ai\backend            │
│  npm install          (first time only) │
│  node server.js       (keep running)    │
│                                         │
│  → http://localhost:3000                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 — Frontend                  │
│  cd c:\rainshield-ai\frontend           │
│  npx --yes http-server . -a localhost -p 5500 --cors│
│                                         │
│  → http://localhost:5500  (open this)   │
└─────────────────────────────────────────┘
```

---

## Screens

| Screen | How to Reach |
|--------|-------------|
| Login / Register | Default landing page |
| Dashboard | After registering |
| Buy Insurance | "Insurance" tab in bottom nav |
| Claim Status | "Claims" tab in bottom nav |
| Profile | "Profile" tab in bottom nav |

---

## Files

```
frontend/
├── index.html    ← All 5 screens (single-page app)
├── style.css     ← Mobile-first design (blue/white/grey)
├── app.js        ← Screen navigation, API calls, AI risk logic
├── hero.png      ← Hero image on login page
└── package.json  ← Frontend start script
```
