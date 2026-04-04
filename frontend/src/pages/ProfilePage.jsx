import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PLANS, formatCurrency } from '../utils/utils';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const EARNING_MAP = {
  'Swiggy': 35, 'Zomato': 35, 'Amazon Flex': 45,
  'Dunzo': 30, 'Flipkart': 40, 'BlueDart': 38, 'Other': 30,
};

export default function ProfilePage() {
  const { user, plan, setUser, setPlan, showToast } = useAppContext();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const currentPlan = PLANS.find((p) => p.id === plan?.planId) || PLANS[1];

  const perOrder = EARNING_MAP[user.platform] || 30;
  const dailyOrders = user.avgDailyOrders || 15;
  const dailyIncomeLow = Math.round(perOrder * dailyOrders * 0.85);
  const dailyIncomeHigh = Math.round(perOrder * dailyOrders * 1.15);
  const riskLow = Math.round(dailyIncomeLow * 0.4);
  const riskHigh = Math.round(dailyIncomeHigh * 0.6);

  const handleLogout = () => {
    localStorage.removeItem('rainshield_user');
    localStorage.removeItem('rainshield_plan');
    setUser(null);
    setPlan(null);
    showToast('Logged out successfully 👋');
    navigate('/');
  };

  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">
        {/* Profile hero */}
        <div className="pf-hero">
          <div className="pf-hero-decor"></div>
          <div className="pf-avatar">{initials}</div>
          <div className="pf-name">{user.name}</div>
          <div className="pf-verified-badge">
            <span className="pf-verified-dot"></span>
            Verified Delivery Partner
          </div>
          <div className="pf-city">📍 {user.city}</div>

          {/* Stats strip */}
          <div className="pf-stats">
            <div className="pf-stat">
              <div className="pf-stat-val">{currentPlan.risk}</div>
              <div className="pf-stat-label">Risk Zone</div>
            </div>
            <div className="pf-stat-div"></div>
            <div className="pf-stat">
              <div className="pf-stat-val">₹{currentPlan.price}</div>
              <div className="pf-stat-label">Weekly</div>
            </div>
            <div className="pf-stat-div"></div>
            <div className="pf-stat">
              <div className="pf-stat-val">Active</div>
              <div className="pf-stat-label">Status</div>
            </div>
          </div>
        </div>

        {/* All cards section */}
        <div className="pf-section">

          {/* Account info card */}
          <div className="pf-card">
            <div className="pf-card-title">Account Details</div>
            <div className="pf-row">
              <span className="pf-row-icon">👤</span>
              <span className="pf-row-label">Full Name</span>
              <span className="pf-row-val">{user.name}</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">📞</span>
              <span className="pf-row-label">Phone</span>
              <span className="pf-row-val">{user.phone}</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">📍</span>
              <span className="pf-row-label">City</span>
              <span className="pf-row-val">{user.city}</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">🆔</span>
              <span className="pf-row-label">User ID</span>
              <span className="pf-row-val pf-row-mono">{user.userId}</span>
            </div>
          </div>

          {/* Delivery Partner Profile */}
          <div className="pf-card">
            <div className="pf-card-title">Delivery Partner Profile</div>
            <div className="pf-row">
              <span className="pf-row-icon">📦</span>
              <span className="pf-row-label">Platform</span>
              <span className="pf-row-val">{user.platform || 'Swiggy'}</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">🏍️</span>
              <span className="pf-row-label">Vehicle Type</span>
              <span className="pf-row-val">{user.vehicleType || 'Bike'}</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">📊</span>
              <span className="pf-row-label">Avg Daily Orders</span>
              <span className="pf-row-val">~{dailyOrders}</span>
            </div>
          </div>

          {/* Income Insight */}
          <div className="pf-card pf-income-card">
            <div className="pf-card-title">Income Insight</div>
            <div className="pf-income-row">
              <div className="pf-income-item">
                <div className="pf-income-icon">💰</div>
                <div>
                  <div className="pf-income-label">Estimated Daily Income</div>
                  <div className="pf-income-val pf-income-green">₹{dailyIncomeLow}–₹{dailyIncomeHigh}/day</div>
                </div>
              </div>
              <div className="pf-income-item">
                <div className="pf-income-icon">⚠️</div>
                <div>
                  <div className="pf-income-label">Income at Risk (disruptions)</div>
                  <div className="pf-income-val pf-income-red">₹{riskLow}–₹{riskHigh}/day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Insurance Plan card */}
          <div className="pf-card">
            <div className="pf-card-header-row">
              <div className="pf-card-title">Insurance Plan</div>
              <div className="pf-active-badge">● Active Plan</div>
            </div>
            <div className="pf-plan-strip">
              <div className="pf-plan-icon">🛡️</div>
              <div className="pf-plan-info">
                <div className="pf-plan-name">{currentPlan.name}</div>
                <div className="pf-plan-sub">{currentPlan.risk} Risk • {currentPlan.trigger}</div>
              </div>
              <div className="pf-plan-price">₹{currentPlan.price}<span>/wk</span></div>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">☂️</span>
              <span className="pf-row-label">Coverage</span>
              <span className="pf-row-val">{formatCurrency(currentPlan.coverage)}</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">📊</span>
              <span className="pf-row-label">Max Weekly Coverage</span>
              <span className="pf-row-val">₹1,200</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">⚡</span>
              <span className="pf-row-label">Payout Speed</span>
              <span className="pf-row-val">Instant (UPI)</span>
            </div>
            <div className="pf-row">
              <span className="pf-row-icon">🤖</span>
              <span className="pf-row-label">Auto-Claim</span>
              <span className="pf-row-val pf-val-enabled">Enabled</span>
            </div>
            <button className="pf-upgrade-btn" onClick={() => navigate('/insurance')}>
              Change Plan →
            </button>
          </div>

          {/* Trust & Security */}
          <div className="pf-card">
            <div className="pf-card-title">Your Protection</div>
            <div className="pf-trust-item">
              <span className="pf-trust-indicator"></span>
              <span className="pf-trust-icon">🤖</span>
              <span className="pf-trust-label">AI Risk Monitoring</span>
              <span className="pf-trust-status">Enabled</span>
            </div>
            <div className="pf-trust-item">
              <span className="pf-trust-indicator"></span>
              <span className="pf-trust-icon">🕵️</span>
              <span className="pf-trust-label">Fraud Detection</span>
              <span className="pf-trust-status">Active</span>
            </div>
            <div className="pf-trust-item">
              <span className="pf-trust-indicator"></span>
              <span className="pf-trust-icon">⚡</span>
              <span className="pf-trust-label">Instant Payout (UPI)</span>
              <span className="pf-trust-status">Ready</span>
            </div>
            <div className="pf-trust-item">
              <span className="pf-trust-indicator"></span>
              <span className="pf-trust-icon">🛡️</span>
              <span className="pf-trust-label">IRDAI Sandbox</span>
              <span className="pf-trust-status">Compliant</span>
            </div>
          </div>

          {/* Settings-like items */}
          <div className="pf-card">
            <div className="pf-card-title">Preferences</div>
            <div className="pf-setting">
              <span className="pf-setting-icon">🔔</span>
              <span className="pf-setting-label">Push Notifications</span>
              <div className="pf-toggle active"><div className="pf-toggle-dot"></div></div>
            </div>
            <div className="pf-setting">
              <span className="pf-setting-icon">📧</span>
              <span className="pf-setting-label">Email Alerts</span>
              <div className="pf-toggle"><div className="pf-toggle-dot"></div></div>
            </div>
            <div className="pf-setting">
              <span className="pf-setting-icon">🌙</span>
              <span className="pf-setting-label">Dark Mode</span>
              <div className="pf-toggle"><div className="pf-toggle-dot"></div></div>
            </div>
          </div>

          {/* Logout */}
          <button className="pf-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            ⚠️ Log Out
          </button>

          <div className="pf-version">RainShield AI v2.0 • Made in India 🇮🇳</div>
        </div>
      </div>

      {/* Logout confirmation overlay */}
      {showLogoutConfirm && (
        <div className="pf-logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="pf-logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-logout-modal-icon">⚠️</div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out? Your session data will be cleared.</p>
            <div className="pf-logout-modal-btns">
              <button className="pf-modal-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="pf-modal-confirm" onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
