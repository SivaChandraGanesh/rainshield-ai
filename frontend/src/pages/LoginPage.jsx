import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { apiRegister, apiGetCities } from '../services/api';
import { getLocalRisk } from '../utils/utils';

const PLATFORMS = ['Swiggy', 'Zomato', 'Amazon Flex', 'Dunzo', 'Flipkart', 'BlueDart', 'Other'];
const VEHICLES = ['Bike', 'Scooter', 'Bicycle', 'Car'];

// Static fallback if API is down
const FALLBACK_CITIES = [
  { group: '🌊 Coastal (High Risk)', risk: 'High', cities: [
    { value: 'Mumbai', label: 'Mumbai, Maharashtra' }, { value: 'Chennai', label: 'Chennai, Tamil Nadu' },
    { value: 'Kolkata', label: 'Kolkata, West Bengal' }, { value: 'Kochi', label: 'Kochi, Kerala' },
  ]},
  { group: '🏙️ Metro (Medium Risk)', risk: 'Medium', cities: [
    { value: 'Delhi', label: 'New Delhi, Delhi NCR' }, { value: 'Bangalore', label: 'Bengaluru, Karnataka' },
    { value: 'Hyderabad', label: 'Hyderabad, Telangana' }, { value: 'Pune', label: 'Pune, Maharashtra' },
  ]},
  { group: '🌄 Tier 2 (Low Risk)', risk: 'Low', cities: [
    { value: 'Indore', label: 'Indore, Madhya Pradesh' }, { value: 'Patna', label: 'Patna, Bihar' },
    { value: 'Other', label: 'Other City' },
  ]},
];

export default function LoginPage() {
  const { setUser, setPlan, setSelectedPlanId, showToast, user } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityGroups, setCityGroups] = useState(FALLBACK_CITIES);
  const [selectedRisk, setSelectedRisk] = useState('');
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  // Fetch cities from API on mount
  useEffect(() => {
    apiGetCities()
      .then((res) => {
        if (res.success && res.data?.length) {
          setCityGroups(res.data);
        }
      })
      .catch(() => { /* fallback already set */ })
      .finally(() => setCitiesLoaded(true));
  }, []);

  // If already logged in, redirect
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter a valid 10-digit mobile number';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name')?.trim();
    const phone = formData.get('phone')?.trim();
    const city = formData.get('city');
    const platform = formData.get('platform');
    const vehicleType = formData.get('vehicleType');
    const avgDailyOrders = formData.get('avgDailyOrders')?.trim();

    if (isLogin) {
      if (!phone) {
        setErrors({ phone: 'Phone number is required' });
        showToast('⚠️ Please enter your phone number');
        return;
      }
      const phoneErr = validatePhone(phone);
      if (phoneErr) {
        setErrors({ phone: phoneErr });
        showToast(`⚠️ ${phoneErr}`);
        return;
      }
      setErrors({});
      try {
        const u = JSON.parse(localStorage.getItem('rainshield_user'));
        const p = JSON.parse(localStorage.getItem('rainshield_plan'));
        if (u && p) {
          setUser(u);
          setPlan(p);
          setSelectedPlanId(p.planId || 'medium');
          showToast(`Welcome back, ${u.name}! 👋`);
          navigate('/dashboard');
        } else {
          showToast('No account found. Please register first.');
          setIsLogin(false);
        }
      } catch (_) {
        showToast('No account found. Please register first.');
        setIsLogin(false);
      }
      return;
    }

    // Validate registration fields
    const newErrors = {};
    if (!name) newErrors.name = 'Full name is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    else {
      const phoneErr = validatePhone(phone);
      if (phoneErr) newErrors.phone = phoneErr;
    }
    if (!city) newErrors.city = 'Please select your city';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErr = Object.values(newErrors)[0];
      showToast(`⚠️ ${firstErr}`);
      return;
    }

    if (!agreed) {
      showToast('⚠️ Please agree to terms & conditions');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      let userData;
      try {
        const result = await apiRegister({ name, phone, city, platform, vehicleType, avgDailyOrders });
        if (result.success) userData = result;
      } catch (_) { }

      const riskProfile = getLocalRisk(city);
      const newUser = {
        name, phone, city,
        userId: userData?.user?.userId || `RS-${Date.now()}`,
        platform: platform || 'Swiggy',
        vehicleType: vehicleType || 'Bike',
        avgDailyOrders: parseInt(avgDailyOrders) || 15,
      };
      const newPlan = userData?.plan || {
        risk: riskProfile.risk,
        premium: riskProfile.premium,
        coverage: riskProfile.coverage,
        planId: riskProfile.planId,
      };

      setUser(newUser);
      setPlan(newPlan);
      setSelectedPlanId(riskProfile.planId);
      showToast(`✅ Welcome, ${name}! RainShield AI activated.`);
      navigate('/dashboard');
    } catch (err) {
      showToast('❌ Something went wrong. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen login-screen">
      {/* Full-bleed hero section */}
      <div className="login-hero-full">
        <img src="/hero.png" alt="Delivery rider in heavy rain" className="login-hero-img" />
        <div className="login-hero-overlay"></div>

        {/* Top branding on hero */}
        <div className="login-hero-top">
          <div className="login-brand">
            <span className="login-brand-icon">🌧️</span>
            <span className="login-brand-name">RainShield AI</span>
          </div>
          <div className="login-hero-pill">
            <span className="pulse-dot"></span>
            LIVE
          </div>
        </div>

        {/* Hero text */}
        <div className="login-hero-content">
          <h1 className="login-hero-title">Rain shouldn't wash away your earnings.</h1>
          <p className="login-hero-tagline">AI-powered income protection for delivery partners</p>
          <p className="login-hero-subtitle">
            Automated insurance payouts for gig workers when weather hits hard.
          </p>
        </div>

        {/* Floating stats */}
        <div className="login-stats-row">
          <div className="login-stat">
            <div className="login-stat-value">10K+</div>
            <div className="login-stat-label">Workers Protected</div>
          </div>
          <div className="login-stat-divider"></div>
          <div className="login-stat">
            <div className="login-stat-value">&lt;3 min</div>
            <div className="login-stat-label">Avg. Payout Time</div>
          </div>
          <div className="login-stat-divider"></div>
          <div className="login-stat">
            <div className="login-stat-value">₹2Cr+</div>
            <div className="login-stat-label">Claims Settled</div>
          </div>
        </div>
      </div>

      {/* Bottom-sheet style form */}
      <div className="login-sheet">
        <div className="login-sheet-handle"></div>

        <div className="login-sheet-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Log in to access your dashboard' : 'Start protecting your income in 30 seconds'}</p>
        </div>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {/* Personal Details Section */}
              <div className="login-section-label">Personal Details</div>

              <div className={`input-group ${errors.name ? 'input-error' : ''}`}>
                <div className="input-icon">👤</div>
                <input name="name" type="text" className="input-field" placeholder="Enter your full name" required autoComplete="name" onFocus={() => setErrors(e => ({...e, name: ''}))} />
              </div>
              {errors.name && <div className="field-error">{errors.name}</div>}

              <div className={`input-group ${errors.phone ? 'input-error' : ''}`}>
                <div className="input-icon">📞</div>
                <input name="phone" type="tel" className="input-field" placeholder="Enter your mobile number" required autoComplete="tel" maxLength="10" onFocus={() => setErrors(e => ({...e, phone: ''}))} />
              </div>
              {errors.phone && <div className="field-error">{errors.phone}</div>}

              <div className={`input-group ${errors.city ? 'input-error' : ''}`}>
                <div className="input-icon">📍</div>
                <select
                  name="city"
                  className="input-field input-select"
                  required
                  onFocus={() => setErrors(e => ({...e, city: ''}))}
                  onChange={(e) => {
                    const val = e.target.value;
                    const group = cityGroups.find(g => g.cities.some(c => c.value === val));
                    setSelectedRisk(group?.risk || '');
                  }}
                >
                  <option value="">{citiesLoaded ? 'Select Operating City' : 'Loading cities...'}</option>
                  {cityGroups.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.cities.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <span className="select-arrow">▾</span>
              </div>
              {selectedRisk && (
                <div className={`login-risk-badge risk-badge-${selectedRisk.toLowerCase()}`}>
                  <span className="login-risk-dot"></span>
                  {selectedRisk} Risk Zone
                </div>
              )}
              {errors.city && <div className="field-error">{errors.city}</div>}

              {/* Delivery Partner Section */}
              <div className="login-persona-section">
                <div className="login-section-label">🏍️ Delivery Partner Details</div>

                <div className="input-group">
                  <div className="input-icon">📦</div>
                  <select name="platform" className="input-field input-select" required>
                    <option value="">Select Delivery Platform</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>

                <div className="input-group">
                  <div className="input-icon">🏍️</div>
                  <select name="vehicleType" className="input-field input-select" required>
                    <option value="">Select Vehicle Type</option>
                    {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>

                <div className="input-group">
                  <div className="input-icon">📊</div>
                  <input name="avgDailyOrders" type="number" className="input-field" placeholder="e.g. 15 orders/day" min="1" max="50" />
                </div>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  🔒 I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> & <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </span>
              </label>
            </>
          )}

          {isLogin && (
            <>
              <div className={`input-group ${errors.phone ? 'input-error' : ''}`}>
                <div className="input-icon">📞</div>
                <input name="phone" type="tel" className="input-field" placeholder="Enter registered mobile number" required autoComplete="tel" maxLength="10" onFocus={() => setErrors(e => ({...e, phone: ''}))} />
              </div>
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </>
          )}

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner"></span> Processing...</>
            ) : (
              isLogin ? 'Log In →' : 'Get Started →'
            )}
          </button>
        </form>

        <div className="login-switch">
          {isLogin ? (
            <>Don't have an account? <button className="link-btn" onClick={() => { setIsLogin(false); setErrors({}); }}>Register</button></>
          ) : (
            <>Already have an account? <button className="link-btn" onClick={() => { setIsLogin(true); setErrors({}); }}>Log In</button></>
          )}
        </div>

        <div className="login-trust">
          <span className="login-trust-icon">🛡️</span>
          <span>Parametric Protection Guaranteed • IRDAI Sandbox</span>
        </div>
      </div>
    </div>
  );
}
