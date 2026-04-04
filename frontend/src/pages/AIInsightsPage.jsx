import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const FEATURES = [
  { name: 'Rainfall (mm)', weight: '0.40', icon: '🌧️' },
  { name: 'Temperature (°C)', weight: '0.25', icon: '🌡️' },
  { name: 'AQI Level', weight: '0.20', icon: '💨' },
  { name: 'City Flood Index', weight: '0.10', icon: '🏙️' },
  { name: 'Historical Claims', weight: '0.05', icon: '📊' },
];

const PIPELINE = [
  { icon: '📡', label: 'Data Ingestion', desc: 'Real-time weather feeds from IMD & OpenWeather' },
  { icon: '⚙️', label: 'Feature Engineering', desc: 'Rainfall, temp, AQI, flood index processed' },
  { icon: '🧠', label: 'Risk Prediction', desc: 'Weighted scoring model calculates risk' },
  { icon: '🎯', label: 'Decision Engine', desc: 'Threshold check → trigger or no-trigger' },
  { icon: '💸', label: 'Auto Payout', desc: 'UPI instant transfer if triggered' },
];

const FRAUD_CHECKS = [
  { icon: '📍', title: 'GPS Validation', desc: 'Location verified against registered city at claim time' },
  { icon: '🔄', title: 'Duplicate Detection', desc: 'Same-day multi-claims from one user are flagged' },
  { icon: '📈', title: 'Behavioral Analysis', desc: 'Unusual claiming patterns trigger manual review' },
  { icon: '🛡️', title: 'Cross-Reference', desc: 'Weather data cross-checked with 3+ independent sources' },
];

export default function AIInsightsPage() {
  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">
        <div className="ai-header">
          <div className="ai-header-icon">🧠</div>
          <h2>AI/ML Engine</h2>
          <p>How our parametric risk model works</p>
        </div>

        {/* Model Inputs */}
        <div className="section-title"><h3>Model Inputs</h3></div>
        <div className="ai-inputs-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="ai-input-card">
              <div className="ai-input-icon">{f.icon}</div>
              <div className="ai-input-info">
                <div className="ai-input-name">{f.name}</div>
                <div className="ai-input-weight">Weight: {f.weight}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Model Output */}
        <div className="section-title"><h3>Model Output</h3></div>
        <div className="ai-output-card">
          <div className="ai-output-row">
            <div className="ai-output-item">
              <div className="ai-output-label">Risk Level</div>
              <div className="ai-output-val ai-val-high">High</div>
            </div>
            <div className="ai-output-divider"></div>
            <div className="ai-output-item">
              <div className="ai-output-label">Confidence</div>
              <div className="ai-output-val">98%</div>
            </div>
            <div className="ai-output-divider"></div>
            <div className="ai-output-item">
              <div className="ai-output-label">Decision</div>
              <div className="ai-output-val ai-val-trigger">TRIGGER</div>
            </div>
          </div>
        </div>

        {/* Visual Decision Flow */}
        <div className="section-title"><h3>Decision Flow</h3></div>
        <div className="ai-flow-card">
          <div className="ai-flow-steps">
            <div className="ai-flow-step">
              <div className="ai-flow-box ai-flow-input">🌧️ Rain: 62mm</div>
              <div className="ai-flow-arrow">→</div>
              <div className="ai-flow-box ai-flow-check">&gt; 50mm Threshold</div>
              <div className="ai-flow-arrow">→</div>
              <div className="ai-flow-box ai-flow-risk">Risk: HIGH</div>
              <div className="ai-flow-arrow">→</div>
              <div className="ai-flow-box ai-flow-trigger">✅ Claim Triggered</div>
            </div>
          </div>
          <div className="ai-flow-note">
            <span>⚡</span> End-to-end decision in under 10 seconds
          </div>
        </div>

        {/* ML Pipeline */}
        <div className="section-title"><h3>ML Pipeline</h3></div>
        <div className="ai-pipeline">
          {PIPELINE.map((step, i) => (
            <div key={i} className="ai-pipe-step">
              <div className="ai-pipe-icon">{step.icon}</div>
              <div className="ai-pipe-content">
                <div className="ai-pipe-label">{step.label}</div>
                <div className="ai-pipe-desc">{step.desc}</div>
              </div>
              {i < PIPELINE.length - 1 && <div className="ai-pipe-connector">│</div>}
            </div>
          ))}
        </div>

        {/* Model Metadata */}
        <div className="section-title"><h3>Model Info</h3></div>
        <div className="ai-meta-card">
          <div className="ai-meta-row">
            <span className="ai-meta-label">Model Type</span>
            <span className="ai-meta-val">Weighted Parametric Scoring</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Accuracy</span>
            <span className="ai-meta-val">96.3%</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">F1 Score</span>
            <span className="ai-meta-val">0.94</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Training Data</span>
            <span className="ai-meta-val">5 years IMD historical</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Last Trained</span>
            <span className="ai-meta-val">March 2026</span>
          </div>
        </div>

        {/* Fraud Detection */}
        <div className="section-title"><h3>🕵️ Fraud Detection</h3></div>
        <div className="ai-fraud-grid">
          {FRAUD_CHECKS.map((f, i) => (
            <div key={i} className="ai-fraud-card">
              <div className="ai-fraud-icon">{f.icon}</div>
              <div className="ai-fraud-title">{f.title}</div>
              <div className="ai-fraud-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
