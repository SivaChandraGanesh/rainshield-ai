import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const UNIT_ECONOMICS = [
  { label: 'Avg Weekly Premium', value: '₹49', icon: '💳', color: '#10B981' },
  { label: 'Avg Weekly Payout', value: '₹30', icon: '💸', color: '#F59E0B' },
  { label: 'Gross Margin / User', value: '₹19', icon: '📈', color: '#3B82F6' },
  { label: 'Margin %', value: '38.7%', icon: '🎯', color: '#8B5CF6' },
];

const KEY_RATIOS = [
  { label: 'Claims Ratio', value: '61.2%', desc: 'Claims paid ÷ Premium collected', status: 'good' },
  { label: 'Expense Ratio', value: '15%', desc: 'Operating costs ÷ Premium collected', status: 'good' },
  { label: 'Combined Ratio', value: '76.2%', desc: 'Claims + Expenses ÷ Premium', status: 'good' },
  { label: 'Profit Margin', value: '23.8%', desc: 'Net underwriting profit', status: 'great' },
];

const PROJECTIONS = [
  { month: 'Month 1', users: '500', premium: '₹24,500', claims: '₹15,000', profit: '₹9,500' },
  { month: 'Month 3', users: '2,000', premium: '₹98,000', claims: '₹60,000', profit: '₹38,000' },
  { month: 'Month 6', users: '8,000', premium: '₹3.9L', claims: '₹2.4L', profit: '₹1.5L' },
  { month: 'Month 12', users: '25,000', premium: '₹12.2L', claims: '₹7.5L', profit: '₹4.7L' },
];

export default function FinancialsPage() {
  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">
        <div className="fin-header">
          <div className="fin-header-icon">💰</div>
          <h2>Financial Model</h2>
          <p>Unit economics & sustainability analysis</p>
        </div>

        {/* Unit Economics */}
        <div className="section-title"><h3>Unit Economics</h3></div>
        <div className="fin-unit-grid">
          {UNIT_ECONOMICS.map((item, i) => (
            <div key={i} className="fin-unit-card" style={{ '--accent': item.color }}>
              <div className="fin-unit-icon">{item.icon}</div>
              <div className="fin-unit-value">{item.value}</div>
              <div className="fin-unit-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* How Pricing Works */}
        <div className="section-title"><h3>How Pricing Works</h3></div>
        <div className="fin-pricing-card">
          <div className="fin-pricing-formula">
            <div className="fin-formula-box">Premium</div>
            <span className="fin-formula-op">=</span>
            <div className="fin-formula-box">Risk Probability</div>
            <span className="fin-formula-op">×</span>
            <div className="fin-formula-box">Expected Loss</div>
            <span className="fin-formula-op">+</span>
            <div className="fin-formula-box">Margin</div>
          </div>
          <div className="fin-pricing-explain">
            <p>
              <strong>Example:</strong> A delivery partner in Mumbai (coastal, high-risk) has a 60% chance of
              experiencing a rain event per week. Expected loss = 0.60 × ₹300 = ₹180/month.
              Weekly premium = ₹69 covers this with a safety buffer for reserves.
            </p>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="section-title"><h3>Key Ratios</h3></div>
        <div className="fin-ratios">
          {KEY_RATIOS.map((r, i) => (
            <div key={i} className="fin-ratio-card">
              <div className="fin-ratio-header">
                <span className="fin-ratio-label">{r.label}</span>
                <span className={`fin-ratio-status fin-status-${r.status}`}>
                  {r.status === 'great' ? '🟢 Excellent' : '🟡 Healthy'}
                </span>
              </div>
              <div className="fin-ratio-value">{r.value}</div>
              <div className="fin-ratio-desc">{r.desc}</div>
            </div>
          ))}
        </div>

        {/* Growth Projections */}
        <div className="section-title"><h3>Growth Projections</h3></div>
        <div className="fin-projections">
          <div className="fin-proj-header">
            <span>Period</span>
            <span>Users</span>
            <span>Premium</span>
            <span>Claims</span>
            <span>Profit</span>
          </div>
          {PROJECTIONS.map((p, i) => (
            <div key={i} className="fin-proj-row">
              <span className="fin-proj-month">{p.month}</span>
              <span>{p.users}</span>
              <span>{p.premium}</span>
              <span>{p.claims}</span>
              <span className="fin-proj-profit">{p.profit}</span>
            </div>
          ))}
        </div>

        {/* Sustainability */}
        <div className="fin-sustain-card">
          <span className="fin-sustain-icon">♻️</span>
          <div>
            <div className="fin-sustain-title">Sustainability Note</div>
            <p>
              With a combined ratio of 76.2%, RainShield AI maintains a healthy underwriting margin.
              The parametric model eliminates claims processing costs, keeping the expense ratio
              at just 15% — well below the industry average of 30%.
              Reinsurance partnerships can further reduce risk exposure.
            </p>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="section-title"><h3>Revenue Streams</h3></div>
        <div className="fin-streams">
          <div className="fin-stream-item">
            <span className="fin-stream-icon">💳</span>
            <div>
              <div className="fin-stream-title">Premium Collection</div>
              <div className="fin-stream-desc">Core weekly subscription revenue</div>
            </div>
            <span className="fin-stream-pct">70%</span>
          </div>
          <div className="fin-stream-item">
            <span className="fin-stream-icon">🤝</span>
            <div>
              <div className="fin-stream-title">B2B Partnerships</div>
              <div className="fin-stream-desc">Swiggy/Zomato integration fees</div>
            </div>
            <span className="fin-stream-pct">20%</span>
          </div>
          <div className="fin-stream-item">
            <span className="fin-stream-icon">📊</span>
            <div>
              <div className="fin-stream-title">Data & Analytics</div>
              <div className="fin-stream-desc">Weather-risk insights licensing</div>
            </div>
            <span className="fin-stream-pct">10%</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
