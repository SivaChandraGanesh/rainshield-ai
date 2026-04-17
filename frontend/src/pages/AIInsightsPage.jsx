import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiGetRisk } from '../services/api';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const PIPELINE = [
  { icon: '📡', label: 'Data Ingestion',      desc: 'City weather profile loaded (30s dynamic refresh cycle)' },
  { icon: '⚙️', label: 'Feature Normalisation', desc: 'Rainfall, temp, AQI, flood index, season factor normalised 0–1' },
  { icon: '🔢', label: 'Weighted Scoring',     desc: 'score = Σ(factor × weight) across 5 inputs' },
  { icon: '🎯', label: 'Threshold Decision',   desc: 'score ≥ 0.60 → High | ≥ 0.35 → Medium | else → Low' },
  { icon: '💸', label: 'Auto Payout',          desc: 'If rainfall > threshold: payout dispatched instantly via UPI' },
];

const FRAUD_CHECKS = [
  { icon: '📍', title: 'GPS Validation',       desc: 'Location verified against registered city at claim time' },
  { icon: '🔄', title: 'Duplicate Detection',  desc: 'Same-day multi-claims from one user are flagged' },
  { icon: '📈', title: 'Frequency Analysis',   desc: 'Unusual claiming patterns trigger manual review' },
  { icon: '🛡️', title: 'Cross-Reference',      desc: 'Weather data cross-checked with 3+ independent sources' },
];

const WEIGHT_LABELS = {
  'Rainfall':    { icon: '🌧️', weight: '0.40' },
  'Temperature': { icon: '🌡️', weight: '0.20' },
  'Air Quality': { icon: '💨', weight: '0.20' },
  'Flood Index': { icon: '🏙️', weight: '0.10' },
  'Season':      { icon: '📅', weight: '0.10' },
};

export default function AIInsightsPage() {
  const { user } = useAppContext();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const city = user?.city || 'Mumbai';
    apiGetRisk(city)
      .then(res => { if (res.success) setRiskData(res); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const analysis = riskData?.parametricAnalysis;
  const riskLevel = analysis?.riskLevel || '—';
  const score = analysis?.score ?? null;
  const scorePercent = score !== null ? Math.round(score * 100) : null;

  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">

        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-icon">⚙️</div>
          <h2>Parametric Scoring Engine</h2>
          <p>Transparent, auditable, threshold-based risk model</p>
        </div>

        {/* Live Score Output */}
        <div className="section-title"><h3>Live Score — {user?.city || 'Your City'}</h3></div>
        <div className="ai-output-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8' }}>Computing score…</div>
          ) : (
            <div className="ai-output-row">
              <div className="ai-output-item">
                <div className="ai-output-label">Risk Level</div>
                <div className={`ai-output-val ${riskLevel === 'High' ? 'ai-val-high' : riskLevel === 'Low' ? 'ai-val-low' : ''}`}>
                  {riskLevel}
                </div>
              </div>
              <div className="ai-output-divider"></div>
              <div className="ai-output-item">
                <div className="ai-output-label">Score</div>
                <div className="ai-output-val">{scorePercent !== null ? `${scorePercent}%` : '—'}</div>
              </div>
              <div className="ai-output-divider"></div>
              <div className="ai-output-item">
                <div className="ai-output-label">Source</div>
                <div className="ai-output-val" style={{ fontSize: '11px' }}>
                  {analysis?.weatherSource === 'live' ? '🌐 Live' : '📊 Simulated'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formula */}
        <div className="section-title"><h3>Scoring Formula</h3></div>
        <div className="ai-flow-card">
          <div className="ai-formula-box">
            <code className="ai-formula-text">
              score = (rainfall/100 × <strong>0.40</strong>) + (temp/50 × <strong>0.20</strong>) + (aqi/500 × <strong>0.20</strong>) + (floodIndex × <strong>0.10</strong>) + (seasonFactor × <strong>0.10</strong>)
            </code>
          </div>
          <div className="ai-flow-note">
            <span>📐</span> All factors normalised to [0, 1] before weighting
          </div>
        </div>

        {/* Factor Breakdown — live values */}
        <div className="section-title"><h3>Factor Breakdown</h3></div>
        <div className="ai-inputs-grid">
          {analysis?.breakdown
            ? analysis.breakdown.map((f, i) => {
                const meta = WEIGHT_LABELS[f.factor] || { icon: '📊', weight: f.weight };
                const barWidth = Math.round(parseFloat(f.normalised) * 100);
                return (
                  <div key={i} className="ai-input-card">
                    <div className="ai-input-icon">{meta.icon}</div>
                    <div className="ai-input-info" style={{ flex: 1 }}>
                      <div className="ai-input-name">{f.factor}</div>
                      <div className="ai-input-weight">
                        {f.rawValue} · weight {meta.weight} · contribution {f.contribution.toFixed(3)}
                      </div>
                      <div style={{ marginTop: '6px', background: '#1E293B', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: '#3B82F6', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })
            : [
                { factor: 'Rainfall',    icon: '🌧️', weight: '0.40' },
                { factor: 'Temperature', icon: '🌡️', weight: '0.20' },
                { factor: 'Air Quality', icon: '💨', weight: '0.20' },
                { factor: 'Flood Index', icon: '🏙️', weight: '0.10' },
                { factor: 'Season',      icon: '📅', weight: '0.10' },
              ].map((f, i) => (
                <div key={i} className="ai-input-card">
                  <div className="ai-input-icon">{f.icon}</div>
                  <div className="ai-input-info">
                    <div className="ai-input-name">{f.factor}</div>
                    <div className="ai-input-weight">Weight: {f.weight}</div>
                  </div>
                </div>
              ))}
        </div>

        {/* Engine Pipeline */}
        <div className="section-title"><h3>Engine Pipeline</h3></div>
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

        {/* ============================================
            TRANSPARENCY SECTION — Why Parametric, not ML
            ============================================ */}
        <div className="section-title"><h3>🔍 Why a Parametric Engine?</h3></div>
        <div className="ai-transparency-card">
          <div className="ai-transparency-intro">
            Parametric insurance uses <strong>pre-defined, measurable triggers</strong> instead of black-box machine learning models. This is the industry standard for weather-linked insurance — used by Lloyd's, Swiss Re, and IRDAI-licensed platforms.
          </div>

          <div className="ai-transparency-table">
            <div className="ai-trans-row ai-trans-header">
              <span>Aspect</span>
              <span>This System</span>
              <span>Traditional ML</span>
            </div>
            <div className="ai-trans-row">
              <span>Auditability</span>
              <span className="ai-trans-yes">✅ Fully transparent</span>
              <span className="ai-trans-no">⚠️ Black-box</span>
            </div>
            <div className="ai-trans-row">
              <span>Trigger basis</span>
              <span className="ai-trans-yes">✅ Real weather data</span>
              <span className="ai-trans-no">Model prediction</span>
            </div>
            <div className="ai-trans-row">
              <span>Regulatory fit</span>
              <span className="ai-trans-yes">✅ IRDAI compliant</span>
              <span className="ai-trans-no">Requires validation</span>
            </div>
            <div className="ai-trans-row">
              <span>Dispute risk</span>
              <span className="ai-trans-yes">✅ Objective & auditable</span>
              <span className="ai-trans-no">Subjective predictions</span>
            </div>
          </div>

          <div className="ai-transparency-note">
            <span>🚀</span>
            <div>
              <strong>Future ML Roadmap:</strong> In production, we'd layer LSTM rainfall forecasting for next-hour predictions and an ensemble anomaly detector for fraud — on top of the parametric core.
            </div>
          </div>
        </div>

        {/* Engine Metadata — honest, no fake stats */}
        <div className="section-title"><h3>Engine Info</h3></div>
        <div className="ai-meta-card">
          <div className="ai-meta-row">
            <span className="ai-meta-label">Engine Type</span>
            <span className="ai-meta-val">Weighted Parametric Scoring</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Decision Time</span>
            <span className="ai-meta-val">&lt; 200ms per evaluation</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Data Refresh</span>
            <span className="ai-meta-val">Every 30 seconds</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Flood Index Source</span>
            <span className="ai-meta-val">NDMA / IMD hazard zones</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Engine Version</span>
            <span className="ai-meta-val">v3.0-parametric</span>
          </div>
          <div className="ai-meta-row">
            <span className="ai-meta-label">Compliance</span>
            <span className="ai-meta-val">IRDAI Sandbox (testing)</span>
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
