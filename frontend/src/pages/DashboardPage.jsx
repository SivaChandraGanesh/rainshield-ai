import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { apiGetWeather, apiCheckClaim, apiGetMonitoringStatus } from '../services/api';
import { formatCurrency } from '../utils/utils';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  try {
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (_) { return '--:--'; }
}

const STATUS_CONFIG = {
  Safe:      { color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: '✅', label: 'Safe Zone' },
  Near:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: '⚠️', label: 'Near Threshold' },
  Triggered: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: '🔴', label: 'Triggered!' },
};

const EARNING_MAP = {
  'Swiggy': 35, 'Zomato': 35, 'Amazon Flex': 45,
  'Dunzo': 30, 'Flipkart': 40, 'BlueDart': 38, 'Other': 30,
};

export default function DashboardPage() {
  const { user, plan, weather, setWeather, setClaim, claim } = useAppContext();
  const navigate = useNavigate();
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Live monitoring state
  const [monitoring, setMonitoring] = useState(null);
  const [monLastUpdated, setMonLastUpdated] = useState(null);
  const [monLoading, setMonLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  // --- Initial weather + claim fetch ---
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      let weatherData = { rainfall: 20, temperature: 33, aqi: 120, humidity: 65 };
      try {
        const w = await apiGetWeather(user.city);
        if (w.success) weatherData = w.data;
      } catch (_) {}
      setWeather(weatherData);

      try {
        const claimData = await apiCheckClaim(user.userId, user.city);
        if (claimData.success) setClaim(claimData);
      } catch (_) {}
    };
    fetchData();
  }, [user, setWeather, setClaim]);

  // --- Live monitoring: poll every 30 seconds ---
  const fetchMonitoring = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiGetMonitoringStatus(user.city);
      if (data.success) {
        setMonitoring(data);
        setMonLastUpdated(new Date().toISOString());
      }
    } catch (_) {}
    setMonLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchMonitoring();
    intervalRef.current = setInterval(fetchMonitoring, 30000);
    return () => clearInterval(intervalRef.current);
  }, [user, fetchMonitoring]);

  if (!user || !plan) return null;

  const price = plan.premium || 49;
  const coverage = plan.coverage || 300;
  const risk = plan.risk || 'Medium';
  const riskPct = risk === 'High' ? 85 : risk === 'Medium' ? 55 : 25;
  const w = weather || { rainfall: 20, temperature: 33, aqi: 120, humidity: 65 };
  const firstName = user.name?.split(' ')[0] || 'User';

  const perOrder = EARNING_MAP[user.platform] || 30;
  const dailyOrders = user.avgDailyOrders || 15;
  const dailyIncome = perOrder * dailyOrders;
  const incomeAtRisk = Math.round(dailyIncome * 0.7);

  // Monitoring derived values
  const monStatus = monitoring?.overallStatus || 'Safe';
  const monCfg = STATUS_CONFIG[monStatus] || STATUS_CONFIG.Safe;
  const rainMon = monitoring?.weather?.rainfall;
  const distPercent = rainMon
    ? Math.min(100, Math.round((rainMon.value / rainMon.threshold) * 100))
    : 0;

  const handleSimulate = () => {
    setSimulating(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 1200);
    setTimeout(() => setSimStep(3), 2400);
    setTimeout(() => {
      const simRainfall = Math.floor(55 + Math.random() * 20);
      setClaim({
        claimTriggered: true, rainfall: simRainfall, triggerThreshold: 50,
        payout: 300, status: 'APPROVED',
        reference: `#RX-${Math.floor(10000 + Math.random() * 90000)}-P`,
        turnaround: '3 Minutes',
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
            <div className="dash-greeting-sub">📍 {user.city} • Parametric monitoring active</div>
          </div>
        </div>

        {/* Alert banner for high risk */}
        {risk === 'High' && (
          <div className="dash-alert stagger-2">
            <span className="dash-alert-icon">⚠️</span>
            <div className="dash-alert-text">
              <strong>High risk zone</strong> — Payout may trigger automatically
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

        {/* ============================================
            LIVE MONITORING PANEL (New)
            ============================================ */}
        <div className="section-title stagger-3">
          <h3>Live Monitoring</h3>
          <span className="badge-live"><span className="pulse-dot-sm"></span> LIVE</span>
        </div>

        <div className="dash-monitor-card stagger-3">
          {/* Header row */}
          <div className="dash-monitor-header">
            <div className="dash-monitor-status-pill" style={{ background: monCfg.bg, color: monCfg.color }}>
              <span>{monCfg.icon}</span>
              <span>{monCfg.label}</span>
            </div>
            <div className="dash-monitor-meta">
              <div className="dash-monitor-source">
                {monitoring?.dataSource === 'live' ? '🌐 Live Data' : '📊 Simulated Data'}
              </div>
              <div className="dash-monitor-time">
                Updated: {monLastUpdated ? formatTime(monLastUpdated) : '—'}
              </div>
            </div>
          </div>

          {monLoading ? (
            <div className="dash-monitor-loading">Fetching monitoring data…</div>
          ) : (
            <>
              {/* Rainfall bar */}
              {rainMon && (
                <div className="dash-monitor-metric">
                  <div className="dash-monitor-metric-row">
                    <span className="dash-monitor-metric-label">🌧️ Rainfall</span>
                    <span className="dash-monitor-metric-vals">
                      <strong>{rainMon.value}mm</strong>
                      <span className="dash-monitor-threshold"> / {rainMon.threshold}mm trigger</span>
                    </span>
                  </div>
                  <div className="dash-monitor-bar-bg">
                    <div
                      className="dash-monitor-bar-fill"
                      style={{
                        width: `${distPercent}%`,
                        background: distPercent >= 100 ? '#EF4444' : distPercent >= 70 ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                  <div className="dash-monitor-dist">
                    {rainMon.distToTrigger > 0
                      ? `${rainMon.distToTrigger}mm away from trigger`
                      : '⚡ Trigger threshold exceeded!'}
                  </div>
                </div>
              )}

              {/* Other metrics mini-row */}
              {monitoring?.weather && (
                <div className="dash-monitor-mini-row">
                  <div className="dash-monitor-mini">
                    <span>🌡️ {monitoring.weather.temperature?.value ?? w.temperature}°C</span>
                    <span className="dash-monitor-mini-label">Temp</span>
                  </div>
                  <div className="dash-monitor-mini">
                    <span>💨 AQI {monitoring.weather.aqi?.value ?? w.aqi}</span>
                    <span className="dash-monitor-mini-label">Air Quality</span>
                  </div>
                  <div className="dash-monitor-mini">
                    <span>📊 {((monitoring.parametricScore ?? 0) * 100).toFixed(1)}%</span>
                    <span className="dash-monitor-mini-label">Risk Score</span>
                  </div>
                </div>
              )}

              <div className="dash-monitor-footer">
                ⏱️ Auto-refreshes every 30 seconds
              </div>
            </>
          )}
        </div>

        {/* Risk gauge */}
        <div className="section-title stagger-3">
          <h3>Real-Time Risk</h3>
        </div>

        <div className="risk-gauge-card stagger-3">
          <div className="risk-gauge-wrap">
            <svg className="risk-gauge-svg" viewBox="0 0 120 70">
              <path d="M10,65 A50,50 0 0,1 110,65" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
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
            <span>Rain risk for {user.city} — {w.rainfall}mm current rainfall</span>
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
            <div className="weather-card-val">{w.humidity || 65}%</div>
            <div className="weather-card-label">Humidity</div>
          </div>
        </div>
        {w.source && (
          <div className="dash-data-source">
            {w.source === 'live' ? '🌐 Live weather data' : '📊 Simulated weather data'}
          </div>
        )}

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
                <span>{simStep >= 1 ? 'Heavy rain detected — exceeds threshold' : '...'}</span>
              </div>
              <div className={`dash-sim-step ${simStep >= 2 ? 'dash-sim-active' : ''}`}>
                <span className="dash-sim-dot">⚙️</span>
                <span>{simStep >= 2 ? 'Parametric engine confirms threshold exceeded' : '...'}</span>
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
            <span>⚙️</span> Scoring Engine
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
            <p>Parametric monitoring is active for your city. Triggers are evaluated against live weather thresholds automatically.</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
