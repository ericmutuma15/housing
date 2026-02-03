import React, { useEffect, useRef, useState } from "react"
import { fetchKpis, fetchUnits, fetchUnitsTimeSeries } from "../api"

export default function Analysis() {
  const [kpis, setKpis] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const chartRef = useRef<HTMLDivElement | null>(null)
  const [timeSeries, setTimeSeries] = useState<any[]>([])
  const timeSeriesRef = useRef<HTMLDivElement | null>(null)
  const pieRef = useRef<HTMLDivElement | null>(null)
  const heatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchKpis().then(setKpis)
    fetchUnits().then(setUnits)
  }, [])

  useEffect(() => {
    fetchUnitsTimeSeries().then(setTimeSeries)
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    // grouped/stacked bar by unit_type showing occupied vs remaining
    const agg: Record<string, { occupied: number; total: number }> = {}
    units.forEach((u) => {
      const t = u.unit_type || 'Unknown'
      if (!agg[t]) agg[t] = { occupied: 0, total: 0 }
      agg[t].total += 1
      if (u.status === 'occupied') agg[t].occupied += 1
    })

    const types = Object.keys(agg)
    const occupied = types.map((t) => agg[t].occupied)
    const remaining = types.map((t) => agg[t].total - agg[t].occupied)

    import("plotly.js-basic-dist").then((Plotly) => {
      const isDark = document.documentElement.classList.contains('dark')
      const data = [
        { x: types, y: occupied, name: 'Occupied', type: 'bar', marker: { color: '#16a34a' } },
        { x: types, y: remaining, name: 'Remaining', type: 'bar', marker: { color: '#ef4444' } },
      ]
      const layout: any = { barmode: 'group', autosize: true, title: 'Units by Type and Occupancy' }
      if (isDark) {
        layout.paper_bgcolor = '#111827'
        layout.plot_bgcolor = '#111827'
        layout.font = { color: '#e5e7eb' }
      }
      // @ts-ignore
      Plotly.newPlot(chartRef.current, data, layout, { responsive: true })
    })
  }, [units])

  // basic stats for units
  const unitStats = React.useMemo(() => {
    if (!units || units.length === 0) return null
    const total = units.length
    const occupied = units.filter((u) => u.status === 'occupied').length
    const avgBenef = units.reduce((s, u) => s + (u.beneficiaries || 0), 0) / total
    const beneficiaries = units.map((u) => u.beneficiaries || 0).sort((a, b) => a - b)
    const median = beneficiaries.length ? (beneficiaries[Math.floor(beneficiaries.length / 2)]) : 0
    return { total, occupied, avgBenef: Math.round(avgBenef * 100) / 100, median }
  }, [units])

  // time series line chart (shows benefitted and units over time)
  useEffect(() => {
    if (!timeSeriesRef.current) return
    if (!timeSeries || timeSeries.length === 0) return
    const years = timeSeries.map((r: any) => r.year)
    const benef = timeSeries.map((r: any) => r.benefitted)
    const unitCounts = timeSeries.map((r: any) => r.units)
    import("plotly.js-basic-dist").then((Plotly) => {
      const isDark = document.documentElement.classList.contains('dark')
      const data = [
        { x: years, y: benef, type: "scatter", mode: "lines+markers", name: "Benefitted", line: { color: "#06b6d4" } },
        { x: years, y: unitCounts, type: "scatter", mode: "lines+markers", name: "Units", line: { color: "#6366f1" } },
      ]
      const layout: any = { title: "Benefitted and Units by Build Year", autosize: true }
      if (isDark) {
        layout.paper_bgcolor = '#111827'
        layout.plot_bgcolor = '#111827'
        layout.font = { color: '#e5e7eb' }
      }
      // @ts-ignore
      Plotly.newPlot(timeSeriesRef.current, data, layout, { responsive: true })
    })
  }, [timeSeries])

  // area chart of beneficiaries over time (smoothed translucent area)
  useEffect(() => {
    if (!heatRef.current) return
    if (!timeSeries || timeSeries.length === 0) return
    const years = timeSeries.map((r: any) => r.year)
    const benef = timeSeries.map((r: any) => r.benefitted)
    import("plotly.js-basic-dist").then((Plotly) => {
      const isDark = document.documentElement.classList.contains('dark')
      const data = [
        { x: years, y: benef, type: 'scatter', mode: 'lines', fill: 'tozeroy', fillcolor: 'rgba(99,102,241,0.2)', line: { color: '#6366f1' }, name: 'Benefitted' },
      ]
      const layout: any = { title: 'Beneficiaries Over Time (area)', autosize: true }
      if (isDark) {
        layout.paper_bgcolor = '#111827'
        layout.plot_bgcolor = '#111827'
        layout.font = { color: '#e5e7eb' }
      }
      // @ts-ignore
      Plotly.newPlot(heatRef.current, data, layout, { responsive: true })
    })
  }, [timeSeries])

  // pie chart for unit types
  useEffect(() => {
    if (!pieRef.current) return
    if (!units || units.length === 0) return
    const agg: Record<string, number> = {}
    units.forEach((u) => {
      const t = u.unit_type || 'Unknown'
      agg[t] = (agg[t] || 0) + 1
    })
    const labels = Object.keys(agg)
    const values = labels.map((l) => agg[l])
    import('plotly.js-basic-dist').then((Plotly) => {
      const isDark = document.documentElement.classList.contains('dark')
      const data = [
        { labels, values, type: 'pie', hole: 0.15, marker: { colors: ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'] } },
      ]
      const layout: any = { autosize: true, title: 'Unit Types Distribution' }
      if (isDark) {
        layout.paper_bgcolor = '#111827'
        layout.plot_bgcolor = '#111827'
        layout.font = { color: '#e5e7eb' }
      }
      // @ts-ignore
      Plotly.newPlot(pieRef.current, data, layout, { responsive: true })
    })
  }, [units])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Units</p>
          <div className="text-3xl font-bold text-sky-600">{kpis?.total_units ?? "-"}</div>
          {unitStats && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Occupancy: <span className="font-semibold text-emerald-600">{Math.round((unitStats.occupied / unitStats.total) * 100)}%</span>
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Occupied Units</p>
          <div className="text-3xl font-bold text-emerald-600">{kpis?.occupied ?? "-"}</div>
          {unitStats && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Vacant: <span className="font-semibold">{unitStats.total - unitStats.occupied}</span>
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Beneficiaries</p>
          <div className="text-3xl font-bold text-amber-600">{unitStats?.avgBenef ?? "-"}</div>
          {unitStats && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Median: <span className="font-semibold">{unitStats.median}</span>
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Beneficiaries</p>
          <div className="text-3xl font-bold text-purple-600">
            {timeSeries.length > 0 
              ? timeSeries[timeSeries.length - 1].benefitted.toLocaleString() 
              : "-"}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">People served</p>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Units by Type & Occupancy</h3>
          <div ref={chartRef} style={{ minHeight: '350px' }} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Unit Types Distribution</h3>
          <div ref={pieRef} style={{ minHeight: '350px' }} />
        </div>
      </div>

      {/* Time Series and Trends */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Beneficiaries & Units Over Time</h3>
        <div ref={timeSeriesRef} style={{ minHeight: '350px' }} />
      </div>

      {/* Area Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Beneficiaries Trend (Area Chart)</h3>
        <div ref={heatRef} style={{ minHeight: '300px' }} />
      </div>
    </div>
  )
}
