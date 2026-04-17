/* ========================================
   RainShield AI - API Service
   All calls go through Vite proxy: /api/* → backend (strips /api prefix)
   ======================================== */

const API = '/api';

export async function apiRegister(data) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetWeather(city = '') {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  const res = await fetch(`${API}/weather${query}`);
  return res.json();
}

export async function apiCheckClaim(userId = '', city = '') {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (city)   params.set('city', city);
  const res = await fetch(`${API}/check-claim?${params}`);
  return res.json();
}

export async function apiGetRisk(city) {
  const res = await fetch(`${API}/ai-risk?city=${encodeURIComponent(city)}`);
  return res.json();
}

export async function apiGetCities() {
  const res = await fetch(`${API}/cities`);
  return res.json();
}

/** Live monitoring — call every 30s from Dashboard */
export async function apiGetMonitoringStatus(city = '') {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  const res = await fetch(`${API}/monitoring-status${query}`);
  return res.json();
}
