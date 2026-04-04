# 🌧️ RainShield AI — Backend

Express.js API server for RainShield AI, providing weather data, risk prediction, user registration, and claim processing.

## Tech Stack

- **Node.js** + **Express 5**
- **CORS** enabled for cross-origin requests
- In-memory user store (prototype)

## Getting Started

```powershell
# 1. Navigate to backend folder
cd e:\downloads1\rainshield-ai-main\rainshield-ai-main\backend

# 2. Install dependencies
npm install

# 3. Start the server
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
node server.js
```

Server runs at **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register a new user (name, phone, city) → returns AI risk profile |
| `GET` | `/weather` | Simulated live weather data (rainfall, temp, AQI, humidity) |
| `GET` | `/check-claim` | Check if rainfall exceeded threshold → auto-approve payout |
| `GET` | `/ai-risk?city=` | AI-based risk prediction by city geography |

### POST /register

**Request:**
```json
{
  "name": "Rahul Kumar",
  "phone": "+91 98765 43210",
  "city": "Mumbai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome, Rahul Kumar! Your account is ready.",
  "user": { "userId": "RS-1711234567890", "name": "Rahul Kumar", "phone": "+91 98765 43210", "city": "Mumbai" },
  "plan": { "risk": "High", "premium": 69, "coverage": 1200, "label": "Maximum Safety", "trigger": "2mm rainfall" }
}
```

### GET /weather

```json
{
  "success": true,
  "data": {
    "rainfall": 62, "temperature": 38, "aqi": 280,
    "humidity": 87, "windSpeed": 25, "condition": "Heavy Rain"
  }
}
```

### GET /check-claim

```json
{
  "success": true,
  "rainfall": 62, "triggerThreshold": 50,
  "claimTriggered": true, "payout": 300,
  "status": "APPROVED",
  "reference": "#RX-29381-P", "turnaround": "3 Minutes"
}
```

### GET /ai-risk?city=Mumbai

```json
{
  "success": true,
  "city": "Mumbai",
  "riskProfile": { "risk": "High", "premium": 69, "coverage": 1200 }
}
```

## Risk Classification

| Tier | Cities | Premium | Coverage |
|------|--------|---------|----------|
| 🌊 High (Coastal) | Mumbai, Chennai, Kolkata, Kochi, Goa, Mangalore, Surat... | ₹69/week | ₹1,200 |
| 🏙️ Medium (Metro) | Delhi, Bangalore, Hyderabad, Pune, Ahmedabad, Jaipur... | ₹49/week | ₹500 |
| 🌄 Low (Other) | All other cities | ₹39/week | ₹300 |
