const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- AI Risk Logic (Simulated) ---
const COASTAL_CITIES = ['mumbai', 'chennai', 'kolkata', 'kochi', 'visakhapatnam', 'mangalore', 'goa', 'surat', 'bhubaneswar', 'pondicherry'];

function getRiskProfile(city) {
  const cityLower = (city || '').toLowerCase();
  if (COASTAL_CITIES.includes(cityLower)) {
    return { risk: 'High', premium: 69, coverage: 1200, label: 'Maximum Safety', trigger: '2mm rainfall' };
  } else if (['delhi', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur'].includes(cityLower)) {
    return { risk: 'Medium', premium: 49, coverage: 500, label: 'Balanced Guard', trigger: '5mm rainfall' };
  } else {
    return { risk: 'Low', premium: 39, coverage: 300, label: 'Light Protection', trigger: '10mm rainfall' };
  }
}

// In-memory user store (prototype)
const users = {};

// POST /register
app.post('/register', (req, res) => {
  const { name, phone, city } = req.body;
  if (!name || !phone || !city) {
    return res.status(400).json({ success: false, message: 'Name, phone and city are required' });
  }
  const riskProfile = getRiskProfile(city);
  const userId = `RS-${Date.now()}`;
  users[phone] = { userId, name, phone, city, plan: riskProfile, createdAt: new Date().toISOString() };
  res.json({
    success: true,
    message: `Welcome, ${name}! Your account is ready.`,
    user: { userId, name, phone, city },
    plan: riskProfile,
    aiNote: 'AI-based risk prediction model assigned your plan based on your city type.'
  });
});

// GET /weather
app.get('/weather', (req, res) => {
  // Simulate live weather data
  const weatherData = {
    rainfall: 62,       // mm — above trigger threshold
    temperature: 38,    // Celsius
    aqi: 280,
    humidity: 87,
    windSpeed: 25,
    condition: 'Heavy Rain',
    timestamp: new Date().toISOString(),
    sensorNode: '#882',
    location: 'Your Area'
  };
  res.json({ success: true, data: weatherData });
});

// GET /check-claim
app.get('/check-claim', (req, res) => {
  const rainfall = 62; // Simulated: matches /weather
  const triggerThreshold = 50;

  const claimTriggered = rainfall > triggerThreshold;
  const payout = claimTriggered ? 300 : 0;

  res.json({
    success: true,
    rainfall,
    triggerThreshold,
    claimTriggered,
    payout,
    status: claimTriggered ? 'APPROVED' : 'NO_TRIGGER',
    message: claimTriggered
      ? `Rain detected at ${rainfall}mm exceeding threshold. Claim auto-approved!`
      : `Rainfall (${rainfall}mm) is below threshold. No claim triggered.`,
    reference: claimTriggered ? `#RX-${Math.floor(10000 + Math.random() * 90000)}-P` : null,
    turnaround: claimTriggered ? '3 Minutes' : null,
    timestamp: new Date().toISOString()
  });
});

// GET /ai-risk
app.get('/ai-risk', (req, res) => {
  const { city } = req.query;
  const riskProfile = getRiskProfile(city);
  res.json({
    success: true,
    city: city || 'Unknown',
    riskProfile,
    modelNote: 'AI-based risk prediction model (rule-based parametric engine)'
  });
});

// Serve index.html for all unknown routes (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌧️  RainShield AI Server running at http://localhost:${PORT}\n`);
  console.log('  API Endpoints:');
  console.log('  POST /register    - User registration');
  console.log('  GET  /weather     - Simulated weather data');
  console.log('  GET  /check-claim - Claim trigger logic');
  console.log('  GET  /ai-risk     - AI risk prediction by city\n');
});
