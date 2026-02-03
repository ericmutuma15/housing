import React, { useEffect, useRef } from "react"

type Props = { items: any[] }

export default function InventoryAnalysis({ items }: Props) {
  const pieRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  const stats = React.useMemo(() => {
    if (!items || items.length === 0) return null
    const totalItems = items.length
    const totalQuantity = items.reduce((s, it) => s + (it.quantity || 0), 0)
    const avgUnitCost = items.reduce((s, it) => s + (it.unit_cost || 0), 0) / totalItems
    const quantities = items.map(it => it.quantity || 0).sort((a,b) => a-b)
    const median = quantities.length ? quantities[Math.floor(quantities.length/2)] : 0
    const lowStock = items.filter(it => (it.quantity||0) < 10).length
    return { totalItems, totalQuantity, avgUnitCost: Math.round(avgUnitCost*100)/100, median, lowStock }
  }, [items])

  useEffect(() => {
    if (!items || items.length === 0) return
    const byCat: Record<string, number> = {}
    items.forEach((it) => {
      byCat[it.category] = (byCat[it.category] || 0) + (it.quantity || 0)
    })

    import("plotly.js-basic-dist").then((Plotly) => {
      const pieData = [
        { labels: Object.keys(byCat), values: Object.values(byCat), type: "pie" },
      ]
      const isDark = document.documentElement.classList.contains('dark')
      const layout: any = { title: "Inventory by Category" }
      if (isDark) { layout.paper_bgcolor = '#111827'; layout.plot_bgcolor = '#111827'; layout.font = { color: '#e5e7eb' } }
      // @ts-ignore
      Plotly.newPlot(pieRef.current, pieData, layout, { responsive: true })

      const topItems = [...items].sort((a, b) => b.quantity - a.quantity).slice(0, 10)
      const barData = [
        { x: topItems.map((i) => i.name), y: topItems.map((i) => i.quantity), type: "bar", marker: { color: "#06b6d4" } },
      ]
      const layout2: any = { title: "Top 10 Inventory Items by Quantity", margin: { b: 150 } }
      if (isDark) { layout2.paper_bgcolor = '#111827'; layout2.plot_bgcolor = '#111827'; layout2.font = { color: '#e5e7eb' } }
      // @ts-ignore
      Plotly.newPlot(barRef.current, barData, layout2, { responsive: true })
    })
  }, [items])

  return (
    <div className="space-y-4">
      {stats && (
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          <div>Total items: {stats.totalItems} • Total qty: {stats.totalQuantity} • Avg cost: {stats.avgUnitCost}</div>
          <div>Median qty: {stats.median} • Low stock (&lt;10): {stats.lowStock}</div>
        </div>
      )}
      <div className="card">
        <div ref={pieRef}></div>
      </div>
      <div className="card">
        <div ref={barRef}></div>
      </div>
    </div>
  )
}
