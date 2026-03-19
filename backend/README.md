# RainShield AI — Backend

> Run this in **Terminal 1** (keep it running)

---

## Terminal 1 — Commands (in order)

```powershell
# 1. Navigate to backend folder
cd c:\rainshield-ai\backend

# 2. Allow scripts to run (Fixes UnauthorizedAccess errors)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 3. Install dependencies (FIRST TIME only)
npm install

# 4. Start the backend server
node server.js
```

✅ Server starts at → **http://localhost:3000**  
✅ Keep this terminal open and running

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/register` | Register user → returns AI risk plan |
| `GET` | `/weather` | Simulated weather (rainfall, temp, AQI) |
| `GET` | `/check-claim` | Claim trigger (rainfall > 50mm → ₹300 payout) |
| `GET` | `/ai-risk?city=` | AI risk prediction by city |

---

## Files

```
backend/
├── server.js       ← Express server + all 4 APIs
├── package.json    ← Dependencies & start script
└── node_modules/   ← express, cors (auto-installed)
```
