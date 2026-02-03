import axios from "axios"

const isProduction = import.meta.env.PROD
const isDev = import.meta.env.DEV

// Determine API base URL based on environment
const API_BASE = isProduction 
  ? "https://housing-iem3.onrender.com"
  : import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000"

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
