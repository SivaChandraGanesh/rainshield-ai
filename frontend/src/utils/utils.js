/* ========================================
   RainShield AI - Utilities & Constants
   ======================================== */

// ---- PLAN DEFINITIONS ----
export const PLANS = [
  {
    id: 'low',
    name: 'Light Protection',
    title: 'Low Risk',
    risk: 'Low',
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
    name: 'Balanced Guard',
    title: 'Medium Risk',
    risk: 'Medium',
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
    name: 'Maximum Safety',
    title: 'High Risk',
    risk: 'High',
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

// ---- CITY RISK CLASSIFICATION ----
const COASTAL = ['mumbai', 'chennai', 'kolkata', 'kochi', 'visakhapatnam', 'goa', 'mangalore', 'surat', 'pondicherry', 'bhubaneswar'];
const METRO = ['delhi', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur'];

export function getLocalRisk(city) {
  const c = (city || '').toLowerCase();
  if (COASTAL.includes(c)) return { risk: 'High', premium: 69, planId: 'high', coverage: 1200 };
  if (METRO.includes(c)) return { risk: 'Medium', premium: 49, planId: 'medium', coverage: 500 };
  return { risk: 'Low', premium: 39, planId: 'low', coverage: 300 };
}

export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}
