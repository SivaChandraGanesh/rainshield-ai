const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- AI Risk Logic (Simulated) ---
const COASTAL_CITIES = ['mumbai', 'chennai', 'kolkata', 'kochi', 'visakhapatnam', 'mangalore', 'goa', 'surat', 'bhubaneswar', 'pondicherry', 'thiruvananthapuram'];

function getRiskProfile(city) {
  const cityLower = (city || '').toLowerCase();
  if (COASTAL_CITIES.includes(cityLower)) {
    return { risk: 'High', premium: 69, coverage: 1200, label: 'Maximum Safety', trigger: '2mm rainfall' };
  } else if (['delhi', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'noida', 'gurugram', 'chandigarh'].includes(cityLower)) {
    return { risk: 'Medium', premium: 49, coverage: 500, label: 'Balanced Guard', trigger: '5mm rainfall' };
  } else {
    return { risk: 'Low', premium: 39, coverage: 300, label: 'Light Protection', trigger: '10mm rainfall' };
  }
}

// In-memory stores (prototype)
const users = {};
const claimTracker = {}; // userId -> { count, timestamps }

// ===========================
// EXISTING APIs (Enhanced)
// ===========================

// POST /register
app.post('/register', (req, res) => {
  const { name, phone, city, platform, vehicleType, avgDailyOrders } = req.body;
  if (!name || !phone || !city) {
    return res.status(400).json({ success: false, message: 'Name, phone and city are required' });
  }
  const riskProfile = getRiskProfile(city);
  const userId = `RS-${Date.now()}`;
  users[phone] = {
    userId, name, phone, city,
    platform: platform || 'Swiggy',
    vehicleType: vehicleType || 'Bike',
    avgDailyOrders: parseInt(avgDailyOrders) || 15,
    plan: riskProfile,
    createdAt: new Date().toISOString(),
  };
  claimTracker[userId] = { count: 0, timestamps: [] };
  res.json({
    success: true,
    message: `Welcome, ${name}! Your account is ready.`,
    user: { userId, name, phone, city, platform, vehicleType, avgDailyOrders },
    plan: riskProfile,
    aiNote: 'AI-based risk prediction model assigned your plan based on your city type.',
  });
});

// GET /weather
app.get('/weather', (req, res) => {
  const weatherData = {
    rainfall: 62,
    temperature: 38,
    aqi: 280,
    humidity: 87,
    windSpeed: 25,
    condition: 'Heavy Rain',
    timestamp: new Date().toISOString(),
    sensorNode: '#882',
    location: 'Your Area',
  };
  res.json({ success: true, data: weatherData });
});

// GET /check-claim (Enhanced with fraud detection)
app.get('/check-claim', (req, res) => {
  const { userId } = req.query;
  const rainfall = 62;
  const triggerThreshold = 50;
  const claimTriggered = rainfall > triggerThreshold;
  const payout = claimTriggered ? 300 : 0;
  const referenceId = claimTriggered ? `RX-${Math.floor(10000 + Math.random() * 90000)}-P` : null;
  const timestamp = new Date().toISOString();

  // Fraud detection: track claims per user
  let fraudFlag = false;
  let fraudMessage = null;
  if (userId && claimTriggered) {
    if (!claimTracker[userId]) {
      claimTracker[userId] = { count: 0, timestamps: [] };
    }
    claimTracker[userId].count += 1;
    claimTracker[userId].timestamps.push(timestamp);

    if (claimTracker[userId].count > 3) {
      fraudFlag = true;
      fraudMessage = 'Suspicious activity detected — excessive claim frequency. Under review.';
    }
  }

  res.json({
    success: true,
    rainfall,
    triggerThreshold,
    claimTriggered,
    payout: fraudFlag ? 0 : payout,
    status: fraudFlag ? 'FLAGGED' : claimTriggered ? 'APPROVED' : 'NOT_TRIGGERED',
    message: fraudFlag
      ? 'Claim flagged for review due to suspicious activity.'
      : claimTriggered
        ? `Rain detected at ${rainfall}mm exceeding ${triggerThreshold}mm threshold. Claim auto-approved!`
        : `Rainfall (${rainfall}mm) is below threshold. No claim triggered.`,
    reference: referenceId,
    turnaround: claimTriggered && !fraudFlag ? '3 Minutes' : null,
    timestamp,
    fraudDetection: {
      flagged: fraudFlag,
      totalClaims: claimTracker[userId]?.count || 0,
      threshold: 3,
      message: fraudMessage,
    },
  });
});

// GET /ai-risk (Enhanced with detailed response)
app.get('/ai-risk', (req, res) => {
  const { city } = req.query;
  const riskProfile = getRiskProfile(city);

  // Simulated rainfall for the city
  const rainfallMap = { High: 62, Medium: 35, Low: 12 };
  const confidenceMap = { High: 94.2, Medium: 87.6, Low: 72.1 };
  const rainfall = rainfallMap[riskProfile.risk] || 35;
  const confidence = confidenceMap[riskProfile.risk] || 80.0;

  res.json({
    success: true,
    city: city || 'Unknown',
    riskProfile,
    aiAnalysis: {
      rainfall,
      riskLevel: riskProfile.risk,
      confidence,
      explanation: 'Risk calculated using rainfall thresholds, historical weather patterns, and location-based geographic factors.',
      modelVersion: 'v2.1-parametric',
      features: [
        { name: 'Rainfall (mm)', weight: 0.45, value: rainfall },
        { name: 'City Risk Zone', weight: 0.25, value: riskProfile.risk },
        { name: 'Historical Claims', weight: 0.15, value: 'Low' },
        { name: 'Seasonal Pattern', weight: 0.15, value: 'Monsoon Active' },
      ],
    },
    modelNote: 'AI-based risk prediction model (rule-based parametric engine)',
  });
});

// ===========================
// NEW PHASE 2 APIs
// ===========================

// GET /api/cities
app.get('/api/cities', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        group: '🌊 Coastal (High Risk)',
        risk: 'High',
        cities: [
          { value: 'Mumbai', label: 'Mumbai, Maharashtra' },
          { value: 'Chennai', label: 'Chennai, Tamil Nadu' },
          { value: 'Kolkata', label: 'Kolkata, West Bengal' },
          { value: 'Kochi', label: 'Kochi, Kerala' },
          { value: 'Visakhapatnam', label: 'Visakhapatnam, Andhra Pradesh' },
          { value: 'Goa', label: 'Panaji, Goa' },
          { value: 'Mangalore', label: 'Mangalore, Karnataka' },
          { value: 'Surat', label: 'Surat, Gujarat' },
          { value: 'Bhubaneswar', label: 'Bhubaneswar, Odisha' },
          { value: 'Pondicherry', label: 'Puducherry, Puducherry' },
          { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram, Kerala' },
        ],
      },
      {
        group: '🏙️ Metro (Medium Risk)',
        risk: 'Medium',
        cities: [
          { value: 'Delhi', label: 'New Delhi, Delhi NCR' },
          { value: 'Bangalore', label: 'Bengaluru, Karnataka' },
          { value: 'Hyderabad', label: 'Hyderabad, Telangana' },
          { value: 'Pune', label: 'Pune, Maharashtra' },
          { value: 'Ahmedabad', label: 'Ahmedabad, Gujarat' },
          { value: 'Jaipur', label: 'Jaipur, Rajasthan' },
          { value: 'Lucknow', label: 'Lucknow, Uttar Pradesh' },
          { value: 'Kanpur', label: 'Kanpur, Uttar Pradesh' },
          { value: 'Noida', label: 'Noida, Uttar Pradesh' },
          { value: 'Gurugram', label: 'Gurugram, Haryana' },
          { value: 'Chandigarh', label: 'Chandigarh, Punjab & Haryana' },
        ],
      },
      {
        group: '🌄 Tier 2 (Low Risk)',
        risk: 'Low',
        cities: [
          { value: 'Indore', label: 'Indore, Madhya Pradesh' },
          { value: 'Bhopal', label: 'Bhopal, Madhya Pradesh' },
          { value: 'Nagpur', label: 'Nagpur, Maharashtra' },
          { value: 'Patna', label: 'Patna, Bihar' },
          { value: 'Coimbatore', label: 'Coimbatore, Tamil Nadu' },
          { value: 'Vadodara', label: 'Vadodara, Gujarat' },
          { value: 'Ranchi', label: 'Ranchi, Jharkhand' },
          { value: 'Dehradun', label: 'Dehradun, Uttarakhand' },
          { value: 'Mysuru', label: 'Mysuru, Karnataka' },
          { value: 'Other', label: 'Other City' },
        ],
      },
    ],
  });
});

// GET /api/policy-terms
app.get('/api/policy-terms', (req, res) => {
  res.json({
    success: true,
    data: {
      coverageRules: [
        { condition: 'Rainfall > 50mm', payout: 300, icon: '🌧️', unit: 'mm' },
        { condition: 'Temperature > 40°C', payout: 200, icon: '🌡️', unit: '°C' },
        { condition: 'AQI > 300', payout: 250, icon: '💨', unit: 'AQI' },
      ],
      maxWeeklyPayout: 1200,
      waitingPeriod: {
        hours: 24,
        description: 'Coverage activates 24 hours after plan activation.',
      },
      exclusions: [
        { title: 'War / Civil Unrest', icon: '⚔️', description: 'No coverage during war, riots, or civil disturbances.' },
        { title: 'Pandemics / Lockdowns', icon: '🦠', description: 'Government-mandated lockdowns or pandemic closures are excluded.' },
        { title: 'App/Server Downtime', icon: '📡', description: 'Platform outages or server downtime are not covered.' },
        { title: 'Personal Inactivity', icon: '🚫', description: 'Voluntarily going offline or not accepting orders.' },
        { title: 'Fraud (GPS Spoofing, Duplicate Claims)', icon: '🕵️', description: 'Any detected fraud results in claim denial and account review.' },
      ],
      compliance: {
        regulatory: 'IRDAI Sandbox',
        status: 'Approved for testing under regulatory sandbox framework.',
        version: 'Policy v2.0',
      },
    },
  });
});

// GET /api/persona-risk
app.get('/api/persona-risk', (req, res) => {
  const orders = parseInt(req.query.orders) || 15;
  const perOrder = parseInt(req.query.perOrder) || 30;
  const estimatedDailyIncome = orders * perOrder;
  const incomeAtRisk = Math.round(estimatedDailyIncome * 0.4);

  res.json({
    success: true,
    data: {
      avgDailyOrders: orders,
      earningsPerOrder: perOrder,
      estimatedDailyIncome,
      incomeAtRisk,
      riskPercentage: 40,
      weeklyIncomeEstimate: estimatedDailyIncome * 6,
      weeklyRiskEstimate: incomeAtRisk * 6,
      note: 'Income estimates based on average platform earnings. Actual income may vary.',
    },
  });
});

// GET /api/financials
app.get('/api/financials', (req, res) => {
  res.json({
    success: true,
    data: {
      unitEconomics: {
        weeklyPremium: 49,
        averagePayout: 30,
        companyMargin: 19,
        marginPercentage: 38.8,
      },
      keyRatios: {
        claimRatio: '61.2%',
        expenseRatio: '18.5%',
        combinedRatio: '79.7%',
      },
      growthProjections: [
        { month: 'Month 1', users: 500, premium: 24500, claims: 15000, profit: 9500 },
        { month: 'Month 3', users: 2000, premium: 98000, claims: 60000, profit: 38000 },
        { month: 'Month 6', users: 8000, premium: 392000, claims: 240000, profit: 152000 },
        { month: 'Month 12', users: 25000, premium: 1225000, claims: 750000, profit: 475000 },
      ],
      revenueStreams: [
        { source: 'Premiums', percentage: 72 },
        { source: 'Data Licensing', percentage: 15 },
        { source: 'Platform Partnerships', percentage: 13 },
      ],
      sustainability: {
        breakEvenMonth: 2,
        note: 'Sustainable parametric insurance model with sub-80% combined ratio.',
      },
    },
  });
});

// ===========================
// SPA FALLBACK
// ===========================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌧️  RainShield AI Server running at http://localhost:${PORT}\n`);
  console.log('  API Endpoints:');
  console.log('  POST /register        - User registration + persona');
  console.log('  GET  /weather         - Simulated weather data');
  console.log('  GET  /check-claim     - Claim trigger + fraud detection');
  console.log('  GET  /ai-risk         - AI risk prediction (enhanced)');
  console.log('  GET  /api/policy-terms - Policy terms & exclusions');
  console.log('  GET  /api/persona-risk - Income risk calculator');
  console.log('  GET  /api/financials   - Financial model data\n');
});
