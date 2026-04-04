/* ========================================
   RainShield AI - API Service
   ======================================== */

const API_BASE = '/api';

export async function apiRegister(data) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetWeather() {
  const res = await fetch(`${API_BASE}/weather`);
  return res.json();
}

export async function apiCheckClaim() {
  const res = await fetch(`${API_BASE}/check-claim`);
  return res.json();
}

export async function apiGetRisk(city) {
  const res = await fetch(`${API_BASE}/ai-risk?city=${encodeURIComponent(city)}`);
  return res.json();
}

export async function apiGetCities() {
  const res = await fetch(`${API_BASE}/cities`);
  return res.json();
}
