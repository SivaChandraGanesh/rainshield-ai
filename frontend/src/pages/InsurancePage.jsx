import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PLANS, formatCurrency } from '../utils/utils';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const PLAN_GRADIENTS = {
  low: 'linear-gradient(135deg, #10B981, #059669)',
  medium: 'linear-gradient(135deg, #F59E0B, #D97706)',
  high: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
};

const PLAN_ICONS = { low: '🌤️', medium: '🌦️', high: '🌧️' };

const EXCLUSION_CHIPS = ['War', 'Pandemics', 'Fraud', 'Inactivity'];

export default function InsurancePage() {
  const { plan, setPlan, setSelectedPlanId, selectedPlanId, showToast } = useAppContext();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(selectedPlanId || 'medium');

  const activePlan = PLANS.find((p) => p.id === selected) || PLANS[1];

  const handleActivate = () => {
    const chosenPlan = PLANS.find((p) => p.id === selected);
    if (chosenPlan) {
      setPlan({
        risk: chosenPlan.risk,
        premium: chosenPlan.price,
        coverage: chosenPlan.coverage,
        planId: chosenPlan.id,
      });
      setSelectedPlanId(chosenPlan.id);
      showToast(`${chosenPlan.name} activated! ✅`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">
        <div className="ins-header">
          <h2>Choose Your Shield</h2>
          <p>Plans matched to your city's parametric risk profile</p>
        </div>

        <div className="ins-plans">
          {PLANS.map((p) => {
            const isSelected = selected === p.id;
            const isActive = plan?.planId === p.id;
            return (
              <div
                key={p.id}
                className={`ins-plan-card ${isSelected ? 'ins-selected' : ''}`}
                onClick={() => setSelected(p.id)}
                style={{ '--plan-gradient': PLAN_GRADIENTS[p.id] }}
              >
                {p.id === 'medium' && <div className="ins-recommended">⭐ Recommended</div>}
                {isActive && <div className="ins-active-tag">Current Plan</div>}

                <div className="ins-plan-top">
                  <div className="ins-plan-icon">{PLAN_ICONS[p.id]}</div>
                  <div className="ins-plan-meta">
                    <div className="ins-plan-name">{p.name}</div>
                    <div className={`ins-plan-risk risk-tag-${p.id}`}>{p.risk} Risk</div>
                  </div>
                  <div className="ins-plan-price">
                    <span className="ins-price-val">₹{p.price}</span>
                    <span className="ins-price-period">/week</span>
                  </div>
                </div>

                <div className="ins-plan-features">
                  <div className="ins-feat">
                    <span className="ins-feat-icon">☂️</span>
                    <span>Coverage: {formatCurrency(p.coverage)}</span>
                  </div>
                  <div className="ins-feat">
                    <span className="ins-feat-icon">🎯</span>
                    <span>Trigger: {p.trigger}</span>
                  </div>
                  <div className="ins-feat">
                    <span className="ins-feat-icon">⚡</span>
                    <span>Instant auto-payout</span>
                  </div>
                  <div className="ins-feat">
                    <span className="ins-feat-icon">⚙️</span>
                    <span>Parametric monitoring 24/7</span>
                  </div>
                </div>

                {/* Exclusion chips */}
                <div className="ins-exclusion-row">
                  <span className="ins-excl-label">Excludes:</span>
                  {EXCLUSION_CHIPS.map((chip) => (
                    <span key={chip} className="ins-excl-chip">{chip}</span>
                  ))}
                </div>

                {isSelected && (
                  <div className="ins-confidence">
                    <div className="ins-conf-label">Plan Match Score</div>
                    <div className="ins-conf-bar">
                      <div className="ins-conf-fill" style={{ width: p.id === 'high' ? '90%' : p.id === 'medium' ? '80%' : '70%' }}></div>
                    </div>
                    <div className="ins-conf-val">{p.id === 'high' ? '90%' : p.id === 'medium' ? '80%' : '70%'} Risk Match</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Policy Terms Link */}
        <button className="ins-terms-link" onClick={() => navigate('/policy-terms')}>
          📜 View Policy Terms & Exclusions →
        </button>

        {/* Engine badge */}
        <div className="ins-ai-badge">
          <span className="ins-ai-icon">⚙️</span>
          <div>
            <div className="ins-ai-title">Parametric Pricing Engine</div>
            <p>Premiums calculated using city flood index, seasonal patterns, and real-time weather thresholds.</p>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="ins-footer">
        <div className="ins-footer-info">
          <div className="ins-footer-label">Selected Plan</div>
          <div className="ins-footer-amount">₹{activePlan.price}<span className="ins-footer-cycle">/week</span></div>
        </div>
        <button className="btn-primary ins-footer-btn" onClick={handleActivate}>
          Activate Plan
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
