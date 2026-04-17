const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env if present (optional - for OpenWeather API key)
try { require('dotenv').config(); } catch (_) {}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============================================================
// PARAMETRIC SCORING ENGINE — Data Tables
// ============================================================

// City flood index: based on NDMA/IMD flood hazard zones (0.0–1.0)
const CITY_FLOOD_INDEX = {
  mumbai: 0.95, chennai: 0.90, kolkata: 0.88, kochi: 0.85,
  visakhapatnam: 0.82, goa: 0.80, mangalore: 0.78, surat: 0.76,
  bhubaneswar: 0.74, pondicherry: 0.72, thiruvananthapuram: 0.70,
  delhi: 0.55, bangalore: 0.50, bengaluru: 0.50, hyderabad: 0.48,
  pune: 0.52, ahmedabad: 0.45, jaipur: 0.35, lucknow: 0.42,
  kanpur: 0.40, noida: 0.50, gurugram: 0.48, chandigarh: 0.38,
  indore: 0.32, bhopal: 0.30, nagpur: 0.38, patna: 0.60,
  coimbatore: 0.40, vadodara: 0.45, ranchi: 0.35, dehradun: 0.42,
  mysuru: 0.38,
};

// Season factor: monsoon months (Jun–Sep) = 1.0, pre/post-monsoon = 0.7, dry = 0.4
function getSeasonFactor() {
  const month = new Date().getMonth() + 1; // 1-indexed
  if (month >= 6 && month <= 9) return 1.0;   // Peak monsoon
  if (month === 5 || month === 10) return 0.7; // Pre/post monsoon
  if (month === 11 || month === 4) return 0.5; // Transition
  return 0.3; // Dry season (Dec–Mar)
}

// City base weather profiles (realistic ranges for simulation)
const CITY_WEATHER_PROFILE = {
  mumbai:          { rainfallBase: 45, rainfallVar: 40, tempBase: 32, aqiBase: 110 },
  chennai:         { rainfallBase: 38, rainfallVar: 35, tempBase: 34, aqiBase: 95 },
  kolkata:         { rainfallBase: 40, rainfallVar: 38, tempBase: 33, aqiBase: 130 },
  kochi:           { rainfallBase: 42, rainfallVar: 35, tempBase: 30, aqiBase: 75 },
  visakhapatnam:   { rainfallBase: 30, rainfallVar: 30, tempBase: 33, aqiBase: 85 },
  goa:             { rainfallBase: 35, rainfallVar: 30, tempBase: 31, aqiBase: 60 },
  mangalore:       { rainfallBase: 38, rainfallVar: 32, tempBase: 30, aqiBase: 70 },
  surat:           { rainfallBase: 28, rainfallVar: 25, tempBase: 35, aqiBase: 140 },
  bhubaneswar:     { rainfallBase: 32, rainfallVar: 28, tempBase: 34, aqiBase: 100 },
  pondicherry:     { rainfallBase: 30, rainfallVar: 28, tempBase: 33, aqiBase: 80 },
  thiruvananthapuram: { rainfallBase: 35, rainfallVar: 30, tempBase: 30, aqiBase: 70 },
  delhi:           { rainfallBase: 18, rainfallVar: 20, tempBase: 38, aqiBase: 280 },
  bangalore:       { rainfallBase: 22, rainfallVar: 22, tempBase: 28, aqiBase: 95 },
  bengaluru:       { rainfallBase: 22, rainfallVar: 22, tempBase: 28, aqiBase: 95 },
  hyderabad:       { rainfallBase: 20, rainfallVar: 20, tempBase: 35, aqiBase: 120 },
  pune:            { rainfallBase: 25, rainfallVar: 22, tempBase: 32, aqiBase: 100 },
  ahmedabad:       { rainfallBase: 15, rainfallVar: 18, tempBase: 40, aqiBase: 160 },
  jaipur:          { rainfallBase: 12, rainfallVar: 15, tempBase: 42, aqiBase: 150 },
  lucknow:         { rainfallBase: 16, rainfallVar: 18, tempBase: 36, aqiBase: 200 },
  kanpur:          { rainfallBase: 15, rainfallVar: 17, tempBase: 37, aqiBase: 220 },
  noida:           { rainfallBase: 18, rainfallVar: 20, tempBase: 37, aqiBase: 260 },
  gurugram:        { rainfallBase: 18, rainfallVar: 20, tempBase: 37, aqiBase: 250 },
  chandigarh:      { rainfallBase: 14, rainfallVar: 16, tempBase: 34, aqiBase: 130 },
  indore:          { rainfallBase: 12, rainfallVar: 14, tempBase: 36, aqiBase: 110 },
  bhopal:          { rainfallBase: 14, rainfallVar: 15, tempBase: 35, aqiBase: 100 },
  nagpur:          { rainfallBase: 16, rainfallVar: 16, tempBase: 38, aqiBase: 110 },
  patna:           { rainfallBase: 18, rainfallVar: 18, tempBase: 36, aqiBase: 180 },
  coimbatore:      { rainfallBase: 20, rainfallVar: 18, tempBase: 32, aqiBase: 90 },
  vadodara:        { rainfallBase: 15, rainfallVar: 15, tempBase: 37, aqiBase: 130 },
  ranchi:          { rainfallBase: 16, rainfallVar: 16, tempBase: 33, aqiBase: 90 },
  dehradun:        { rainfallBase: 20, rainfallVar: 18, tempBase: 30, aqiBase: 85 },
  mysuru:          { rainfallBase: 18, rainfallVar: 15, tempBase: 30, aqiBase: 75 },
};

// Lightweight seeded pseudo-random so values change each 30s but are deterministic per call
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDynamicWeather(city) {
  const cityKey = (city || 'mumbai').toLowerCase().replace(/\s+/g, '');
  const profile = CITY_WEATHER_PROFILE[cityKey] || { rainfallBase: 20, rainfallVar: 20, tempBase: 34, aqiBase: 130 };

  // Seed changes every 30 seconds, making weather dynamic but stable within a window
  const seed = Math.floor(Date.now() / 30000);
  const r1 = seededRandom(seed + 1);
  const r2 = seededRandom(seed + 2);
  const r3 = seededRandom(seed + 3);
  const r4 = seededRandom(seed + 4);

  // Apply monsoon multiplier based on season
  const seasonFactor = getSeasonFactor();
  const monsoonMultiplier = 0.5 + seasonFactor * 1.0; // 0.5–1.5x

  const rainfall = Math.round(
    Math.max(0, (profile.rainfallBase + (r1 - 0.4) * profile.rainfallVar) * monsoonMultiplier)
  );
  const temperature = Math.round(profile.tempBase + (r2 - 0.5) * 6);
  const aqi = Math.round(profile.aqiBase + (r3 - 0.5) * 60);
  const humidity = Math.round(50 + seasonFactor * 30 + (r4 - 0.5) * 15);
  const windSpeed = Math.round(8 + r1 * 20);

  const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Moderate Rain', 'Heavy Rain'];
  const conditionIndex = Math.min(5, Math.floor(rainfall / 15));
  const condition = conditions[conditionIndex];

  return { rainfall, temperature, aqi, humidity, windSpeed, condition };
}

// ============================================================
// PARAMETRIC SCORING FORMULA
// ============================================================

function computeParametricScore(rainfall, temperature, aqi, cityFloodIndex, seasonFactor) {
  const rainfallScore   = Math.min(rainfall / 100, 1.0) * 0.40;
  const temperatureScore = Math.min(temperature / 50, 1.0) * 0.20;
  const aqiScore        = Math.min(aqi / 500, 1.0) * 0.20;
  const floodScore      = cityFloodIndex * 0.10;
  const seasonScore     = seasonFactor * 0.10;

  const total = rainfallScore + temperatureScore + aqiScore + floodScore + seasonScore;
  return Math.min(parseFloat(total.toFixed(4)), 1.0);
}

function scoreToRisk(score) {
  if (score >= 0.60) return 'High';
  if (score >= 0.35) return 'Medium';
  return 'Low';
}

function riskToPlan(risk) {
  if (risk === 'High')   return { premium: 69, coverage: 1200, label: 'Maximum Safety', trigger: 30, planId: 'high' };
  if (risk === 'Medium') return { premium: 49, coverage: 500,  label: 'Balanced Guard',  trigger: 50, planId: 'medium' };
  return                        { premium: 39, coverage: 300,  label: 'Light Protection', trigger: 70, planId: 'low' };
}

// ============================================================
// In-memory stores
// ============================================================
const users = {};
const claimTracker = {};

// ============================================================
// EXISTING APIs — Upgraded
// ============================================================

// POST /register
app.post('/register', (req, res) => {
  const { name, phone, city, platform, vehicleType, avgDailyOrders } = req.body;
  if (!name || !phone || !city) {
    return res.status(400).json({ success: false, message: 'Name, phone and city are required' });
  }

  const cityKey = city.toLowerCase();
  const weatherNow = getDynamicWeather(cityKey);
  const floodIndex = CITY_FLOOD_INDEX[cityKey] || 0.40;
  const seasonFactor = getSeasonFactor();
  const score = computeParametricScore(
    weatherNow.rainfall, weatherNow.temperature, weatherNow.aqi, floodIndex, seasonFactor
  );
  const risk = scoreToRisk(score);
  const planDetails = riskToPlan(risk);

  const userId = `RS-${Date.now()}`;
  users[phone] = {
    userId, name, phone, city,
    platform: platform || 'Swiggy',
    vehicleType: vehicleType || 'Bike',
    avgDailyOrders: parseInt(avgDailyOrders) || 15,
    plan: { risk, ...planDetails },
    createdAt: new Date().toISOString(),
  };
  claimTracker[userId] = { count: 0, timestamps: [] };

  res.json({
    success: true,
    message: `Welcome, ${name}! Your account is ready.`,
    user: { userId, name, phone, city, platform, vehicleType, avgDailyOrders },
    plan: { risk, trigger: `${planDetails.trigger}mm rainfall`, ...planDetails },
    engineNote: 'Risk plan assigned by Parametric Scoring Engine using city flood index, current weather, and seasonal factors.',
  });
});

// GET /weather — Dynamic simulated weather per city
app.get('/weather', (req, res) => {
  const city = req.query.city || 'mumbai';
  const w = getDynamicWeather(city);

  res.json({
    success: true,
    data: {
      ...w,
      timestamp: new Date().toISOString(),
      sensorNode: `#${Math.floor(800 + Math.random() * 200)}`,
      location: city.charAt(0).toUpperCase() + city.slice(1),
      source: 'simulated', // Change to "live" when OpenWeather is integrated
    },
  });
});

// GET /check-claim — Dynamically triggered based on actual weather
app.get('/check-claim', (req, res) => {
  const { userId, city } = req.query;
  const resolvedCity = city || (userId && users[Object.keys(users).find(k => users[k].userId === userId)]?.city) || 'mumbai';

  const w = getDynamicWeather(resolvedCity);
  const user = Object.values(users).find(u => u.userId === userId);
  const triggerThreshold = user?.plan?.trigger || 50;

  const rainfall = w.rainfall;
  const claimTriggered = rainfall > triggerThreshold;
  const payout = claimTriggered ? (user?.plan?.coverage ? Math.round(user.plan.coverage * 0.25) : 300) : 0;
  const referenceId = claimTriggered ? `RX-${Math.floor(10000 + Math.random() * 90000)}-P` : null;
  const timestamp = new Date().toISOString();

  // Fraud detection
  let fraudFlag = false;
  let fraudMessage = null;
  if (userId && claimTriggered) {
    if (!claimTracker[userId]) claimTracker[userId] = { count: 0, timestamps: [] };
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
        : `Rainfall (${rainfall}mm) is below threshold (${triggerThreshold}mm). No claim triggered.`,
    reference: referenceId,
    turnaround: claimTriggered && !fraudFlag ? '3 Minutes' : null,
    timestamp,
    weatherSource: 'simulated',
    fraudDetection: {
      flagged: fraudFlag,
      totalClaims: claimTracker[userId]?.count || 0,
      threshold: 3,
      message: fraudMessage,
    },
  });
});

// GET /ai-risk — Parametric Scoring Engine (replaces fake ML claims)
app.get('/ai-risk', (req, res) => {
  const city = req.query.city || 'mumbai';
  const cityKey = city.toLowerCase().replace(/\s+/g, '');
  const w = getDynamicWeather(cityKey);
  const floodIndex = CITY_FLOOD_INDEX[cityKey] || 0.40;
  const seasonFactor = getSeasonFactor();

  const rainfallNorm   = Math.min(w.rainfall / 100, 1.0);
  const tempNorm       = Math.min(w.temperature / 50, 1.0);
  const aqiNorm        = Math.min(w.aqi / 500, 1.0);

  const score = computeParametricScore(w.rainfall, w.temperature, w.aqi, floodIndex, seasonFactor);
  const risk  = scoreToRisk(score);
  const plan  = riskToPlan(risk);

  const month = new Date().getMonth() + 1;
  const seasonLabel = (month >= 6 && month <= 9) ? 'Peak Monsoon'
    : (month === 5 || month === 10) ? 'Pre/Post Monsoon'
    : (month === 11 || month === 4) ? 'Transition'
    : 'Dry Season';

  res.json({
    success: true,
    city,
    riskProfile: { risk, ...plan },
    parametricAnalysis: {
      score: parseFloat(score.toFixed(4)),
      riskLevel: risk,
      formula: 'score = (rainfall/100 × 0.40) + (temp/50 × 0.20) + (aqi/500 × 0.20) + (floodIndex × 0.10) + (seasonFactor × 0.10)',
      breakdown: [
        { factor: 'Rainfall',     rawValue: `${w.rainfall}mm`, normalised: rainfallNorm.toFixed(2),  weight: 0.40, contribution: parseFloat((rainfallNorm * 0.40).toFixed(4)) },
        { factor: 'Temperature',  rawValue: `${w.temperature}°C`, normalised: tempNorm.toFixed(2), weight: 0.20, contribution: parseFloat((tempNorm * 0.20).toFixed(4)) },
        { factor: 'Air Quality',  rawValue: `AQI ${w.aqi}`, normalised: aqiNorm.toFixed(2),          weight: 0.20, contribution: parseFloat((aqiNorm * 0.20).toFixed(4)) },
        { factor: 'Flood Index',  rawValue: floodIndex.toFixed(2), normalised: floodIndex.toFixed(2), weight: 0.10, contribution: parseFloat((floodIndex * 0.10).toFixed(4)) },
        { factor: 'Season',       rawValue: seasonLabel,  normalised: seasonFactor.toFixed(2),         weight: 0.10, contribution: parseFloat((seasonFactor * 0.10).toFixed(4)) },
      ],
      weatherSource: 'simulated',
    },
    engineNote: 'Parametric Scoring Engine — transparent, auditable, threshold-based risk model. No black-box ML.',
    engineVersion: 'v3.0-parametric',
  });
});

// ============================================================
// NEW: GET /api/monitoring-status — Live Monitoring Endpoint
// ============================================================
app.get('/monitoring-status', (req, res) => {
  const city = req.query.city || 'mumbai';
  const cityKey = city.toLowerCase().replace(/\s+/g, '');
  const w = getDynamicWeather(cityKey);
  const floodIndex = CITY_FLOOD_INDEX[cityKey] || 0.40;
  const seasonFactor = getSeasonFactor();
  const score = computeParametricScore(w.rainfall, w.temperature, w.aqi, floodIndex, seasonFactor);

  // Thresholds
  const RAIN_TRIGGER  = 50;
  const RAIN_NEAR     = 35;  // "Near" zone
  const TEMP_TRIGGER  = 40;
  const AQI_TRIGGER   = 300;

  const rainStatus = w.rainfall >= RAIN_TRIGGER ? 'Triggered'
    : w.rainfall >= RAIN_NEAR ? 'Near'
    : 'Safe';

  const tempStatus = w.temperature >= TEMP_TRIGGER ? 'Triggered' : 'Safe';
  const aqiStatus  = w.aqi >= AQI_TRIGGER ? 'Triggered' : 'Safe';

  const overallStatus = (rainStatus === 'Triggered' || tempStatus === 'Triggered' || aqiStatus === 'Triggered')
    ? 'Triggered' : (rainStatus === 'Near' ? 'Near' : 'Safe');

  res.json({
    success: true,
    city: city.charAt(0).toUpperCase() + city.slice(1),
    lastUpdated: new Date().toISOString(),
    dataSource: 'simulated',
    overallStatus,
    parametricScore: parseFloat(score.toFixed(4)),
    weather: {
      rainfall:    { value: w.rainfall,    threshold: RAIN_TRIGGER,  unit: 'mm',  status: rainStatus,  distToTrigger: Math.max(0, RAIN_TRIGGER - w.rainfall) },
      temperature: { value: w.temperature, threshold: TEMP_TRIGGER,  unit: '°C',  status: tempStatus,  distToTrigger: Math.max(0, TEMP_TRIGGER - w.temperature) },
      aqi:         { value: w.aqi,         threshold: AQI_TRIGGER,   unit: 'AQI', status: aqiStatus,   distToTrigger: Math.max(0, AQI_TRIGGER - w.aqi) },
      humidity:    { value: w.humidity,    unit: '%' },
    },
  });
});

// ============================================================
// EXISTING Support APIs
// ============================================================

app.get('/cities', (req, res) => {
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

app.get('/policy-terms', (req, res) => {
  res.json({
    success: true,
    data: {
      coverageRules: [
        { condition: 'Rainfall > 50mm', payout: 300, icon: '🌧️', unit: 'mm' },
        { condition: 'Temperature > 40°C', payout: 200, icon: '🌡️', unit: '°C' },
        { condition: 'AQI > 300', payout: 250, icon: '💨', unit: 'AQI' },
      ],
      maxWeeklyPayout: 1200,
      waitingPeriod: { hours: 24, description: 'Coverage activates 24 hours after plan activation.' },
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

app.get('/persona-risk', (req, res) => {
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

app.get('/financials', (req, res) => {
  res.json({
    success: true,
    data: {
      unitEconomics: { weeklyPremium: 49, averagePayout: 30, companyMargin: 19, marginPercentage: 38.8 },
      keyRatios: { claimRatio: '61.2%', expenseRatio: '18.5%', combinedRatio: '79.7%' },
      growthProjections: [
        { month: 'Month 1',  users: 500,   premium: 24500,   claims: 15000,  profit: 9500 },
        { month: 'Month 3',  users: 2000,  premium: 98000,   claims: 60000,  profit: 38000 },
        { month: 'Month 6',  users: 8000,  premium: 392000,  claims: 240000, profit: 152000 },
        { month: 'Month 12', users: 25000, premium: 1225000, claims: 750000, profit: 475000 },
      ],
      revenueStreams: [
        { source: 'Premiums', percentage: 72 },
        { source: 'Data Licensing', percentage: 15 },
        { source: 'Platform Partnerships', percentage: 13 },
      ],
      sustainability: { breakEvenMonth: 2, note: 'Sustainable parametric insurance model with sub-80% combined ratio.' },
    },
  });
});

// ============================================================
// SPA FALLBACK
// ============================================================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌧️  RainShield AI Server running at http://localhost:${PORT}\n`);
  console.log('  Parametric Scoring Engine: ACTIVE');
  console.log('  Dynamic weather simulation: ON (city-seeded, 30s refresh cycle)\n');
  console.log('  API Endpoints:');
  console.log('  POST /register              - User registration + parametric risk plan');
  console.log('  GET  /weather?city=X        - Dynamic simulated weather per city');
  console.log('  GET  /check-claim           - Claim trigger (uses live weather values)');
  console.log('  GET  /ai-risk?city=X        - Parametric Scoring Engine analysis');
  console.log('  GET  /monitoring-status     - Live monitoring dashboard feed');
  console.log('  GET  /cities                - City list with risk zones');
  console.log('  GET  /policy-terms          - Policy terms & exclusions');
  console.log('  GET  /persona-risk          - Income risk calculator');
  console.log('  GET  /financials            - Financial model data\n');
});
