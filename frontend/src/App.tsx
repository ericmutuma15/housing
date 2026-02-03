import React from "react"
import { Routes, Route, Link } from "react-router-dom"
import logo from "./assets/boma-logo.png"
import Analysis from "./pages/Analysis"
import GIS from "./pages/GIS"
import Inventory from "./pages/Inventory"

export default function App() {
  const [dark, setDark] = React.useState<boolean>(() => typeof window !== 'undefined' && (localStorage.getItem('theme') === 'dark'))

  React.useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b">
        <div className="app-container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Boma Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-semibold">Housing Dashboards</h1>
              <p className="text-sm text-gray-500 dark:text-gray-300">Data Analysis · GIS · Inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="space-x-2 hidden sm:block">
              <Link className="inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700" to="/analysis">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 13l3-3 3 6 4-8"/></svg>
                <span className="text-sky-600">Analysis</span>
              </Link>
              <Link className="inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700" to="/gis">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0v9"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 4 5 4 9c0 6 8 13 8 13s8-7 8-13c0-4-4-7-8-7z"/></svg>
                <span className="text-sky-600">GIS</span>
              </Link>
              <Link className="inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700" to="/inventory">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>
                <span className="text-sky-600">Inventory</span>
              </Link>
            </nav>

            <button aria-label="Toggle theme" onClick={() => setDark((d: boolean) => !d)} className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1M12 20v1M4.2 4.2l.7.7M18.1 18.1l.7.7M1 12h1M22 12h1M4.2 19.8l.7-.7M18.1 5.9l.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
              <div className="w-10 h-6 relative">
                <div className={`absolute inset-0 rounded-full transition ${dark ? 'bg-sky-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition ${dark ? 'translate-x-4' : ''}`}></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="app-container py-8">
        <Routes>
          <Route path="/" element={<Analysis />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/gis" element={<GIS />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </main>
    </div>
  )
}
