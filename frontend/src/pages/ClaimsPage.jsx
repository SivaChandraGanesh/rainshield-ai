import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { apiCheckClaim } from '../services/api';
import { formatCurrency } from '../utils/utils';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const TIMELINE = [
  { icon: '📡', title: 'Weather Detection', desc: 'Satellite sensors detected heavy rainfall exceeding threshold', status: 'done', time: '10:32 AM' },
  { icon: '🤖', title: 'AI Risk Analysis', desc: 'Neural network confirmed parametric trigger conditions met', status: 'done', time: '10:33 AM' },
  { icon: '✅', title: 'Claim Auto-Approved', desc: 'Smart contract validated — no manual review needed', status: 'done', time: '10:33 AM' },
  { icon: '💸', title: 'Instant Payout Sent', desc: 'Funds transferred to your linked UPI/bank account', status: 'completed', time: '10:35 AM' },
];

export default function ClaimsPage() {
  const { user, claim, setClaim, plan } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchClaim = async () => {
      try {
        const data = await apiCheckClaim();
        if (data.success) setClaim(data);
      } catch (_) {
        setClaim({
          claimTriggered: true, rainfall: 62, triggerThreshold: 50,
          payout: 300, status: 'APPROVED', reference: '#RX-29381-P', turnaround: '3 Minutes',
        });
      }
    };
    if (!claim) fetchClaim();
  }, [user, claim, setClaim]);

  if (!user) return null;

  const c = claim || {};

  return (
    <div className="screen active">
      <TopBar showBack />

      <div className="page-content">
        {/* Success header */}
        <div className="cl-success-header">
          <div className="cl-success-icon-wrap">
            <div className="cl-success-ring"></div>
            <div className="cl-success-icon">🎉</div>
          </div>
          <h2>Claim {c.claimTriggered ? 'Approved' : 'Processing'}!</h2>
          <p>Your parametric trigger was automatically detected</p>
        </div>

        {/* Payout card */}
        <div className="cl-payout-card">
          <div className="cl-payout-decor"></div>
          <div className="cl-payout-label">Total Payout</div>
          <div className="cl-payout-amount">₹{c.payout || 300}</div>
          <div className="cl-payout-method">
            <span>⚡</span> UPI Instant Transfer
          </div>
        </div>

        {/* Stats strip */}
        <div className="cl-stats-row">
          <div className="cl-stat">
            <div className="cl-stat-val">{c.rainfall || 62}mm</div>
            <div className="cl-stat-label">Rainfall</div>
          </div>
          <div className="cl-stat-div"></div>
          <div className="cl-stat">
            <div className="cl-stat-val">{c.triggerThreshold || 50}mm</div>
            <div className="cl-stat-label">Threshold</div>
          </div>
          <div className="cl-stat-div"></div>
          <div className="cl-stat">
            <div className="cl-stat-val">{c.turnaround || '3 Min'}</div>
            <div className="cl-stat-label">Turnaround</div>
          </div>
        </div>

        {/* Animated timeline */}
        <div className="cl-timeline-section">
          <h3 className="cl-timeline-title">Event Detection Timeline</h3>
          <div className="cl-timeline">
            {TIMELINE.map((item, i) => (
              <div key={i} className={`cl-tl-item cl-tl-animate`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="cl-tl-left">
                  <div className={`cl-tl-dot ${item.status}`}>
                    {item.status === 'completed' ? '✓' : (i + 1)}
                  </div>
                  {i < TIMELINE.length - 1 && <div className="cl-tl-line"></div>}
                </div>
                <div className="cl-tl-content">
                  <div className="cl-tl-head">
                    <span className="cl-tl-icon">{item.icon}</span>
                    <span className="cl-tl-title">{item.title}</span>
                    <span className="cl-tl-time">{item.time}</span>
                  </div>
                  <div className="cl-tl-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="cl-info-grid">
          <div className="cl-info-item">
            <div className="cl-info-label">📋 Reference</div>
            <div className="cl-info-val">{c.reference || '#RX-29381-P'}</div>
          </div>
          <div className="cl-info-item">
            <div className="cl-info-label">📊 Status</div>
            <div className="cl-info-val cl-status-approved">{c.status || 'APPROVED'}</div>
          </div>
        </div>

        <div className="cl-return-wrap">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
