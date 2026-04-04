import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { apiGetWeather, apiCheckClaim } from '../services/api';
import { formatCurrency } from '../utils/utils';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const EARNING_MAP = {
  'Swiggy': 35, 'Zomato': 35, 'Amazon Flex': 45,
  'Dunzo': 30, 'Flipkart': 40, 'BlueDart': 38, 'Other': 30,
};

export default function DashboardPage() {
  const { user, plan, weather, setWeather, setClaim, claim } = useAppContext();
  const navigate = useNavigate();
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      let weatherData = { rainfall: 62, temperature: 38, aqi: 280, humidity: 87 };
      try {
        const w = await apiGetWeather();
        if (w.success) weatherData = w.data;
      } catch (_) { }
      setWeather(weatherData);

      try {
        const claimData = await apiCheckClaim();
        if (claimData.success) setClaim(claimData);
      } catch (_) { }
    };
    fetchData();
  }, [user, setWeather, setClaim]);

  if (!user || !plan) return null;

  const price = plan.premium || 49;
  const coverage = plan.coverage || 300;
  const risk = plan.risk || 'Medium';
  const riskPct = risk === 'High' ? 85 : risk === 'Medium' ? 55 : 25;
  const w = weather || { rainfall: 62, temperature: 38, aqi: 280, humidity: 87 };
  const firstName = user.name?.split(' ')[0] || 'User';

  const perOrder = EARNING_MAP[user.platform] || 30;
  const dailyOrders = user.avgDailyOrders || 15;
  const dailyIncome = perOrder * dailyOrders;
  const incomeAtRisk = Math.round(dailyIncome * 0.7);

  const handleSimulate = () => {
    setSimulating(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 1200);
    setTimeout(() => setSimStep(3), 2400);
    setTimeout(() => {
      setClaim({
        claimTriggered: true, rainfall: 62, triggerThreshold: 50,
        payout: 300, status: 'APPROVED', reference: `#RX-${Math.floor(10000 + Math.random() * 90000)}-P`, turnaround: '3 Minutes',
      });
      setSimStep(4);
    }, 3600);
    setTimeout(() => { setSimulating(false); setSimStep(0); }, 6000);
  };

  return (
    <div className="screen active">
      <TopBar showNotif />

      <div className="page-content">
        {/* Greeting */}
        <div className="dash-greeting stagger-1">
          <div>
            <div className="dash-greeting-text">{getGreeting()}, {firstName} 👋</div>
            <div className="dash-greeting-sub">📍 {user.city} • Weather monitoring active</div>
          </div>
        </div>

        {/* Alert banner for high risk */}
        {risk === 'High' && (
          <div className="dash-alert stagger-2">
            <span className="dash-alert-icon">⚠️</span>
            <div className="dash-alert-text">
              <strong>Heavy rain alert</strong> — Payout may trigger automatically
            </div>
          </div>
        )}

        {/* Partner Profile Card */}
        {user.platform && (
          <div className="dash-partner-card stagger-2">
            <div className="dash-partner-header">
              <span className="dash-partner-icon">🏍️</span>
              <span className="dash-partner-title">Partner Profile</span>
            </div>
            <div className="dash-partner-grid">
              <div className="dash-partner-item">
                <div className="dash-partner-label">Platform</div>
                <div className="dash-partner-val">{user.platform}</div>
              </div>
              <div className="dash-partner-item">
                <div className="dash-partner-label">Vehicle</div>
                <div className="dash-partner-val">{user.vehicleType || 'Bike'}</div>
              </div>
              <div className="dash-partner-item">
                <div className="dash-partner-label">Daily Orders</div>
                <div className="dash-partner-val">~{dailyOrders}</div>
              </div>
              <div className="dash-partner-item">
                <div className="dash-partner-label">Est. Daily Income</div>
                <div className="dash-partner-val dash-partner-income">₹{dailyIncome}</div>
              </div>
            </div>
          </div>
        )}

        {/* Income at Risk Card */}
        <div className="dash-risk-income stagger-2">
          <div className="dash-risk-income-left">
            <div className="dash-risk-income-icon">⚠️</div>
            <div>
              <div className="dash-risk-income-label">Income at Risk</div>
              <div className="dash-risk-income-desc">Estimated daily loss during disruptions</div>
            </div>
          </div>
          <div className="dash-risk-income-val">₹{incomeAtRisk}</div>
        </div>

        {/* Hero plan card */}
        <div className="dash-hero-card stagger-2">
          <div className="dash-card-decor"></div>
          <div className="dash-card-decor-2"></div>
          <div className="plan-row">
            <div>
              <div className="plan-label">Active Plan</div>
              <div className="plan-price">₹{price}<sub>/week</sub></div>
            </div>
            <div className="status-pill"><div className="status-dot"></div>Active</div>
          </div>
          <div className="coverage-row">
            <div className="coverage-info">
              <div className="coverage-label">Coverage Amount</div>
              <div className="coverage-amount">{formatCurrency(coverage)}.00</div>
            </div>
            <button className="btn-outline" onClick={() => navigate('/insurance')}>Upgrade</button>
          </div>
        </div>

        {/* Risk gauge */}
        <div className="section-title stagger-3">
          <h3>Real-Time Risk</h3>
          <span className="badge-live"><span className="pulse-dot-sm"></span> LIVE</span>
        </div>

        <div className="risk-gauge-card stagger-3">
          <div className="risk-gauge-wrap">
            <svg className="risk-gauge-svg" viewBox="0 0 120 70">
              <path
                d="M10,65 A50,50 0 0,1 110,65"
                fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round"
              />
              <path
                d="M10,65 A50,50 0 0,1 110,65"
                fill="none"
                stroke="url(#riskGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${riskPct * 1.57} 157`}
                className="risk-gauge-fill"
              />
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="risk-gauge-label">
              <div className={`risk-gauge-value risk-${risk.toLowerCase()}`}>{riskPct}%</div>
              <div className="risk-gauge-text">{risk} Risk</div>
            </div>
          </div>
          <div className="risk-gauge-info">
            <span className="risk-icon-sm">🌧️</span>
            <span>Rain risk for {user.city} based on {w.rainfall}mm rainfall</span>
          </div>
        </div>

        {/* Weather cards */}
        <div className="section-title"><h3>Weather Now</h3></div>
        <div className="weather-grid-v2 stagger-4">
          <div className="weather-card-v2 weather-temp">
            <div className="weather-card-icon">🌡️</div>
            <div className="weather-card-val">{w.temperature}°C</div>
            <div className="weather-card-label">Temperature</div>
          </div>
          <div className="weather-card-v2 weather-aqi">
            <div className="weather-card-icon">💨</div>
            <div className="weather-card-val">{w.aqi}</div>
            <div className="weather-card-label">Air Quality</div>
          </div>
          <div className="weather-card-v2 weather-rain">
            <div className="weather-card-icon">🌧️</div>
            <div className="weather-card-val">{w.rainfall}mm</div>
            <div className="weather-card-label">Rainfall</div>
          </div>
          <div className="weather-card-v2 weather-humid">
            <div className="weather-card-icon">💧</div>
            <div className="weather-card-val">{w.humidity || 87}%</div>
            <div className="weather-card-label">Humidity</div>
          </div>
        </div>

        {/* Simulate Rain Event */}
        <div className="section-title"><h3>Simulation</h3></div>
        <div className="dash-sim-card stagger-5">
          {!simulating && simStep === 0 && (
            <>
              <p className="dash-sim-desc">Test the parametric trigger system with a simulated rain event</p>
              <button className="btn-primary dash-sim-btn" onClick={handleSimulate}>
                🌧️ Simulate Rain Event
              </button>
            </>
          )}
          {simulating && (
            <div className="dash-sim-steps">
              <div className={`dash-sim-step ${simStep >= 1 ? 'dash-sim-active' : ''}`}>
                <span className="dash-sim-dot">🌧️</span>
                <span>{simStep >= 1 ? 'Heavy rain detected — 62mm' : '...'}</span>
              </div>
              <div className={`dash-sim-step ${simStep >= 2 ? 'dash-sim-active' : ''}`}>
                <span className="dash-sim-dot">🤖</span>
                <span>{simStep >= 2 ? 'AI confirms threshold exceeded' : '...'}</span>
              </div>
              <div className={`dash-sim-step ${simStep >= 3 ? 'dash-sim-active' : ''}`}>
                <span className="dash-sim-dot">✅</span>
                <span>{simStep >= 3 ? 'Claim auto-approved!' : '...'}</span>
              </div>
              <div className={`dash-sim-step ${simStep >= 4 ? 'dash-sim-active dash-sim-payout' : ''}`}>
                <span className="dash-sim-dot">💸</span>
                <span>{simStep >= 4 ? '₹300 credited to UPI instantly!' : '...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="dash-actions stagger-5">
          <button className="dash-action-btn" onClick={() => navigate('/insurance')}>
            <span className="dash-action-icon">🛡️</span>
            <span>Buy Insurance</span>
          </button>
          <button className="dash-action-btn" onClick={() => navigate('/claims')}>
            <span className="dash-action-icon">📋</span>
            <span>Claim Status</span>
          </button>
        </div>

        {/* Explore More */}
        <div className="section-title"><h3>Explore</h3></div>
        <div className="dash-explore stagger-6">
          <button className="dash-explore-btn" onClick={() => navigate('/ai-insights')}>
            <span>🧠</span> AI Insights
          </button>
          <button className="dash-explore-btn" onClick={() => navigate('/financials')}>
            <span>💰</span> Financials
          </button>
          <button className="dash-explore-btn" onClick={() => navigate('/policy-terms')}>
            <span>📜</span> Policy Terms
          </button>
        </div>

        {/* Recent Activity */}
        <div className="section-title"><h3>Recent Activity</h3></div>
        <div className="activity-list stagger-6">
          <div className="activity-item">
            <div className="activity-icon activity-icon-pay">💳</div>
            <div className="activity-text">
              <div className="activity-title">Premium Paid</div>
              <div className="activity-sub">Automatic • 2 days ago</div>
            </div>
            <div className="activity-amount negative">-₹{price}</div>
          </div>
          {claim?.claimTriggered && (
            <div className="activity-item" onClick={() => navigate('/claims')} style={{ cursor: 'pointer' }}>
              <div className="activity-icon activity-icon-claim">💰</div>
              <div className="activity-text">
                <div className="activity-title">Payout Received</div>
                <div className="activity-sub">Auto-triggered • Today</div>
              </div>
              <div className="activity-amount positive">+₹{claim.payout}</div>
            </div>
          )}
          <div className="activity-item" onClick={() => navigate('/claims')} style={{ cursor: 'pointer' }}>
            <div className="activity-icon">✅</div>
            <div className="activity-text">
              <div className="activity-title">Policy Renewed</div>
              <div className="activity-sub">System Update • Today</div>
            </div>
            <div className="activity-amount">›</div>
          </div>
        </div>

        {/* Coverage area */}
        <div className="coverage-map-card mt-16">
          <div className="map-placeholder">
            🗺️
            <div className="map-overlay">📍 {user.city} Coverage Area</div>
          </div>
          <div className="map-info">
            <p>Cloud density is increasing in your quadrant. We are monitoring parametric triggers for potential payouts.</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
