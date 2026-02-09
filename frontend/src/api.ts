import axios from "axios"

// Determine API base URL. Default to the deployed backend so
// both development and production fetch from the same deployed service.
// Allow override with `VITE_API_BASE` for local testing if needed.
const API_BASE = import.meta.env.VITE_API_BASE || "https://housing-1-yxt5.onrender.com"

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
