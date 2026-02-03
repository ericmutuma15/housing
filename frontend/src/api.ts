import axios from "axios"

// Determine API base URL based on deployment context
// If running on a deployed domain (not localhost), always use production backend
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
)

const API_BASE = isLocalhost
  ? import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000"
  : "https://housing-iem3.onrender.com"

export async function fetchKpis() {
  const r = await axios.get(`${API_BASE}/api/kpis`)
  return r.data
}

export async function fetchUnits() {
  const r = await axios.get(`${API_BASE}/api/units?limit=500`)
  return r.data
}

export async function fetchUnitsTimeSeries() {
  const r = await axios.get(`${API_BASE}/api/units/time_series`)
  return r.data
}

export async function fetchInventory() {
  const r = await axios.get(`${API_BASE}/api/inventory?limit=200`)
  return r.data
}
