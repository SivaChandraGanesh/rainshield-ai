import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const SECTIONS = [
  {
    id: 'coverage',
    icon: '☂️',
    title: 'Coverage Rules',
    items: [
      { icon: '🌧️', text: 'Rainfall exceeds 50mm → Payout of ₹300' },
      { icon: '🌡️', text: 'Temperature exceeds 40°C → Payout of ₹200' },
      { icon: '💨', text: 'AQI exceeds 300 → Payout of ₹250' },
      { icon: '📊', text: 'Maximum weekly payout capped at ₹1,200' },
      { icon: '⚡', text: 'Payouts are auto-triggered — no manual filing required' },
    ],
  },
  {
    id: 'exclusions',
    icon: '🚫',
    title: 'Coverage Exclusions',
    items: [
      { icon: '⚔️', text: 'War, armed conflict, or civil unrest' },
      { icon: '🦠', text: 'Government-declared pandemics or lockdowns' },
      { icon: '🖥️', text: 'Platform / server downtime (Swiggy, Zomato outages)' },
      { icon: '🛑', text: 'Personal inactivity or voluntary time off' },
      { icon: '🕵️', text: 'Fraud — GPS spoofing, duplicate claims, false data' },
      { icon: '🔧', text: 'Vehicle breakdown or mechanical failure' },
      { icon: '📍', text: 'Claims from non-registered operating city' },
    ],
  },
  {
    id: 'waiting',
    icon: '⏳',
    title: 'Waiting Period',
    items: [
      { icon: '🕐', text: '24-hour cooling period after plan activation' },
      { icon: '📋', text: 'Claims triggered within the first 24 hours are not eligible' },
      { icon: '✅', text: 'After 24 hours, coverage is fully active and automatic' },
    ],
  },
  {
    id: 'limits',
    icon: '📏',
    title: 'Coverage Limits',
    items: [
      { icon: '💰', text: 'Per-event payout: ₹200 – ₹300 depending on trigger' },
      { icon: '📅', text: 'Weekly payout cap: ₹1,200 across all triggers' },
      { icon: '🔄', text: 'Coverage resets every Monday at 12:00 AM IST' },
      { icon: '👤', text: 'One active policy per registered phone number' },
    ],
  },
  {
    id: 'data',
    icon: '📡',
    title: 'Data & Verification',
    items: [
      { icon: '🛰️', text: 'Weather data sourced from IMD & OpenWeather API' },
      { icon: '📍', text: 'GPS location verified at time of trigger event' },
      { icon: '🤖', text: 'AI cross-validates claims against historical patterns' },
      { icon: '🔐', text: 'All data encrypted and stored per IRDAI sandbox guidelines' },
    ],
  },
];

export default function PolicyTermsPage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('coverage');
  const [acknowledged, setAcknowledged] = useState(false);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">
        <div className="pt-header">
          <div className="pt-header-icon">📜</div>
          <h2>Policy Terms & Conditions</h2>
          <p>Understand your coverage, exclusions, and limits</p>
        </div>

        <div className="pt-sections">
          {SECTIONS.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div key={section.id} className={`pt-accordion ${isOpen ? 'pt-open' : ''}`}>
                <button className="pt-accordion-header" onClick={() => toggleSection(section.id)}>
                  <div className="pt-accordion-left">
                    <span className="pt-accordion-icon">{section.icon}</span>
                    <span className="pt-accordion-title">{section.title}</span>
                  </div>
                  <span className={`pt-accordion-arrow ${isOpen ? 'pt-arrow-open' : ''}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="pt-accordion-body">
                    {section.items.map((item, i) => (
                      <div key={i} className="pt-rule-item" style={{ animationDelay: `${i * 0.05}s` }}>
                        <span className="pt-rule-icon">{item.icon}</span>
                        <span className="pt-rule-text">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-irdai-badge">
          <span className="pt-irdai-icon">🏛️</span>
          <div>
            <div className="pt-irdai-title">IRDAI Sandbox Compliant</div>
            <p>This product operates under the Insurance Regulatory and Development Authority of India's sandbox framework.</p>
          </div>
        </div>

        <div className="pt-acknowledge">
          <label className="checkbox-row">
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
            <span className="checkmark"></span>
            <span className="checkbox-label">I have read and understand the policy terms, exclusions, and coverage limits.</span>
          </label>
        </div>

        <button
          className={`btn-primary pt-understand-btn ${acknowledged ? '' : 'pt-btn-disabled'}`}
          disabled={!acknowledged}
          onClick={() => navigate(-1)}
        >
          I Understand ✓
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
