/* ========================================
   RainShield AI - Frontend Logic (app.js)
   ======================================== */

const API_BASE = 'http://localhost:3000';

// ---- PLAN DEFINITIONS ----
const PLANS = [
    {
        id: 'low',
        title: 'Low Risk',
        sublabel: 'Light Protection',
        price: 39,
        coverage: 300,
        trigger: '10mm rainfall',
        features: ['Coverage up to ₹300/week', 'Trigger: 10mm rainfall'],
        icons: ['✅', '💧'],
        recommended: false,
        confidence: null,
    },
    {
        id: 'medium',
        title: 'Medium Risk',
        sublabel: 'Balanced Guard',
        price: 49,
        coverage: 500,
        trigger: '5mm rainfall',
        features: ['Coverage up to ₹500/week', 'Trigger: 5mm rainfall', 'Instant AI Payouts'],
        icons: ['✅', '🌧️', '⚡'],
        recommended: true,
        confidence: '98.4% Accuracy',
    },
    {
        id: 'high',
        title: 'High Risk',
        sublabel: 'Maximum Safety',
        price: 69,
        coverage: 1200,
        trigger: '2mm (Drizzle)',
        features: ['Coverage up to ₹1,200/week', 'Trigger: 2mm (Drizzle)', 'Priority Settlements'],
        icons: ['✅', '🌧️', '🏆'],
        recommended: false,
        confidence: null,
    }
];

// ---- STATE ----
let state = {
    user: null,
    plan: null,
    weather: null,
    claim: null,
    selectedPlanId: 'medium',
    previousScreen: 'screen-dashboard'
};

// ---- UTILITY ----
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

function showScreen(id) {
    state.previousScreen = document.querySelector('.screen.active')?.id || 'screen-dashboard';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    window.scrollTo(0, 0);
}

function goBack() {
    showScreen(state.previousScreen || 'screen-dashboard');
}

function setNav(activeId) {
    // no-op; nav items auto-highlight via screen class
}

function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// ---- API CALLS ----
async function apiRegister(data) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function apiGetWeather() {
    const res = await fetch(`${API_BASE}/weather`);
    return res.json();
}

async function apiCheckClaim() {
    const res = await fetch(`${API_BASE}/check-claim`);
    return res.json();
}

async function apiGetRisk(city) {
    const res = await fetch(`${API_BASE}/ai-risk?city=${encodeURIComponent(city)}`);
    return res.json();
}

// ---- RISK UTILITY (client-side mirror) ----
const COASTAL = ['mumbai', 'chennai', 'kolkata', 'kochi', 'visakhapatnam', 'goa', 'mangalore', 'surat', 'pondicherry', 'bhubaneswar'];
const METRO = ['delhi', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur'];

function getLocalRisk(city) {
    const c = (city || '').toLowerCase();
    if (COASTAL.includes(c)) return { risk: 'High', premium: 69, planId: 'high', coverage: 1200 };
    if (METRO.includes(c)) return { risk: 'Medium', premium: 49, planId: 'medium', coverage: 500 };
    return { risk: 'Low', premium: 39, planId: 'low', coverage: 300 };
}

// ---- REGISTER FORM ----
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('inp-name').value.trim();
    const phone = document.getElementById('inp-phone').value.trim();
    const city = document.getElementById('inp-city').value;

    if (!name || !phone || !city) { showToast('Please fill all fields'); return; }

    const btn = document.getElementById('btn-register');
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    try {
        let userData;
        try {
            const result = await apiRegister({ name, phone, city });
            if (result.success) {
                userData = result;
            }
        } catch (_) {
            // Backend not reachable - use client-side AI logic
        }

        // Compute risk locally regardless (instant fallback)
        const riskProfile = getLocalRisk(city);

        state.user = { name, phone, city, userId: userData?.user?.userId || `RS-${Date.now()}` };
        state.plan = userData?.plan || { risk: riskProfile.risk, premium: riskProfile.premium, coverage: riskProfile.coverage, planId: riskProfile.planId };
        state.selectedPlanId = riskProfile.planId;

        // Persist to localStorage
        localStorage.setItem('rainshield_user', JSON.stringify(state.user));
        localStorage.setItem('rainshield_plan', JSON.stringify(state.plan));

        populateDashboard();
        populateInsurance();
        populateProfile();
        showScreen('screen-dashboard');
        showToast(`Welcome, ${name}! 🌧️ RainShield AI activated.`);
    } catch (err) {
        showToast('Something went wrong. Try again.');
        console.error(err);
    } finally {
        btn.innerHTML = 'Get Started &nbsp;→';
        btn.disabled = false;
    }
});

// ---- POPULATE DASHBOARD ----
async function populateDashboard() {
    if (!state.user) return;
    const plan = state.plan || {};

    // Update plan card
    const price = plan.premium || 49;
    const coverage = plan.coverage || 300;
    document.getElementById('dash-price').innerHTML = `₹${price}<sub>/week</sub>`;
    document.getElementById('dash-coverage').textContent = formatCurrency(coverage) + '.00';
    document.getElementById('dash-activity-price').textContent = price;

    // Fetch weather (with fallback)
    let weather = { rainfall: 62, temperature: 38, aqi: 280, humidity: 87 };
    try {
        const w = await apiGetWeather();
        if (w.success) weather = w.data;
    } catch (_) { }
    state.weather = weather;

    document.getElementById('dash-temp').textContent = `${weather.temperature}°C`;
    document.getElementById('dash-aqi').textContent = weather.aqi;
    document.getElementById('dash-rain').textContent = `${weather.rainfall}mm`;
    document.getElementById('dash-humidity').textContent = `${weather.humidity || 87}%`;

    // Risk label
    const risk = plan.risk || 'Medium';
    const riskEl = document.getElementById('dash-risk-label');
    riskEl.textContent = risk;
    riskEl.className = 'risk-title-val risk-' + risk.toLowerCase();

    // Risk bar fill
    const riskPct = risk === 'High' ? '85%' : risk === 'Medium' ? '55%' : '25%';
    document.getElementById('dash-risk-bar').style.width = riskPct;

    // Claim check (async, update UI)
    loadClaimData();
}

async function loadClaimData() {
    try {
        const claim = await apiCheckClaim();
        if (claim.success) {
            state.claim = claim;
            // Update claim page
            document.getElementById('claim-payout').textContent = `₹${claim.payout}`;
            if (claim.reference) document.getElementById('claim-ref').textContent = claim.reference;
            if (claim.turnaround) document.getElementById('claim-turnaround').textContent = claim.turnaround;
            const desc = document.getElementById('timeline-rain-desc');
            if (desc) desc.textContent = `Intensity: ${claim.rainfall}mm/hr exceeding threshold at your location.`;
        }
    } catch (_) { }
}

// ---- POPULATE INSURANCE PAGE ----
function populateInsurance() {
    const container = document.getElementById('plan-cards-container');
    const aiRisk = (state.plan?.planId) || state.selectedPlanId || 'medium';

    container.innerHTML = PLANS.map(plan => {
        const isSelected = plan.id === aiRisk;
        const isRecommended = plan.id === aiRisk || plan.recommended;

        return `
    <div class="plan-card ${isSelected ? 'selected' : ''}" id="plan-card-${plan.id}" onclick="selectPlan('${plan.id}')">
      ${isSelected ? '<div class="recommended-badge">RECOMMENDED</div>' : ''}
      <div class="plan-card-top">
        <div>
          <div class="plan-title">${plan.title}</div>
          <div class="plan-sublabel ${plan.id}">${plan.sublabel.toUpperCase()}</div>
        </div>
        <div class="plan-price-block">
          <div class="price">₹${plan.price}</div>
          <div class="period">/week</div>
        </div>
      </div>
      <div class="plan-features">
        ${plan.features.map((f, i) => `<div class="plan-feature"><span class="feat-icon">${plan.icons[i] || '✅'}</span>${f}</div>`).join('')}
      </div>
      ${plan.confidence ? `
      <div class="confidence-bar-section">
        <div class="confidence-label">System Confidence: ${plan.confidence}</div>
        <div class="confidence-track"><div class="confidence-fill"></div></div>
      </div>` : ''}
    </div>`;
    }).join('');

    updateFooterAmount(aiRisk);
}

function selectPlan(planId) {
    state.selectedPlanId = planId;
    // De-select all
    document.querySelectorAll('.plan-card').forEach(c => {
        c.classList.remove('selected');
        const badge = c.querySelector('.recommended-badge');
        if (badge) badge.remove();
    });
    // Select chosen
    const chosenCard = document.getElementById(`plan-card-${planId}`);
    if (chosenCard) {
        chosenCard.classList.add('selected');
        if (!chosenCard.querySelector('.recommended-badge')) {
            const badge = document.createElement('div');
            badge.className = 'recommended-badge';
            badge.textContent = 'RECOMMENDED';
            chosenCard.prepend(badge);
        }
    }
    updateFooterAmount(planId);
}

function updateFooterAmount(planId) {
    const plan = PLANS.find(p => p.id === planId);
    if (plan) {
        document.getElementById('footer-amount').textContent = `₹${plan.price}.00`;
    }
}

// ---- ACTIVATE PLAN ----
document.getElementById('btn-activate').addEventListener('click', () => {
    const planDef = PLANS.find(p => p.id === state.selectedPlanId) || PLANS[1];
    state.plan = {
        risk: planDef.title.split(' ')[0],   // 'Low' / 'Medium' / 'High'
        premium: planDef.price,
        coverage: planDef.coverage,
        planId: planDef.id,
        label: planDef.sublabel
    };
    localStorage.setItem('rainshield_plan', JSON.stringify(state.plan));
    populateDashboard();
    populateProfile();
    showScreen('screen-dashboard');
    showToast(`✅ ${planDef.title} plan activated! Coverage: ₹${planDef.coverage}/week`);
});

// ---- PROFILE PAGE ----
function populateProfile() {
    if (!state.user) return;
    const u = state.user;
    const p = state.plan || {};
    const initials = u.name ? u.name.charAt(0).toUpperCase() : 'R';
    document.getElementById('profile-avatar').textContent = initials;
    document.getElementById('profile-name').textContent = u.name;
    document.getElementById('profile-city').textContent = '📍 ' + u.city;
    document.getElementById('prof-name').textContent = u.name;
    document.getElementById('prof-phone').textContent = u.phone;
    document.getElementById('prof-city').textContent = u.city;
    document.getElementById('prof-id').textContent = u.userId || 'RS-2024-001';
    document.getElementById('prof-plan').textContent = `₹${p.premium || 49}/week`;
    document.getElementById('prof-risk').textContent = p.risk || 'Medium';
    document.getElementById('prof-coverage').textContent = formatCurrency(p.coverage || 300);
}

// ---- LOGOUT ----
function logout() {
    localStorage.removeItem('rainshield_user');
    localStorage.removeItem('rainshield_plan');
    state = { user: null, plan: null, weather: null, claim: null, selectedPlanId: 'medium', previousScreen: 'screen-dashboard' };
    showScreen('screen-login');
    showToast('Logged out successfully.');
}

// ---- LINK: Log In (shortcut) ----
document.getElementById('link-login').addEventListener('click', (e) => {
    e.preventDefault();
    // For demo: quick-fill and go to dashboard if stored user exists
    const stored = loadStoredSession();
    if (!stored) showToast('Please register first.');
});

// ---- RESTORE SESSION (localStorage) ----
function loadStoredSession() {
    try {
        const u = JSON.parse(localStorage.getItem('rainshield_user'));
        const p = JSON.parse(localStorage.getItem('rainshield_plan'));
        if (u && p) {
            state.user = u;
            state.plan = p;
            state.selectedPlanId = p.planId || 'medium';
            return true;
        }
    } catch (_) { }
    return false;
}

// ---- INIT ----
(function init() {
    // Build insurance plan cards on first load
    populateInsurance();

    // Check for stored session
    if (loadStoredSession()) {
        populateDashboard();
        populateInsurance();
        populateProfile();
        showScreen('screen-dashboard');
    }

    // Load claim data for claims screen default view
    loadClaimData();
})();
