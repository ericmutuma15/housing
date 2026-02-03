import React, { useEffect, useState, useRef } from "react"
import { fetchInventory } from "../api"
import InventoryAnalysis from "../components/InventoryAnalysis"

export default function Inventory() {
  const [items, setItems] = useState<any[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement | null>(null)
  const categoryChartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchInventory().then(setItems)
  }, [])

  // Generate category breakdown visualization
  useEffect(() => {
    if (!chartRef.current || items.length === 0) return
    
    const categoryAgg: Record<string, number> = {}
    items.forEach((item) => {
      const cat = item.category || 'Uncategorized'
      categoryAgg[cat] = (categoryAgg[cat] || 0) + item.quantity
    })

    const labels = Object.keys(categoryAgg)
    const values = labels.map((l) => categoryAgg[l])

    import('plotly.js-basic-dist').then((Plotly) => {
      const isDark = document.documentElement.classList.contains('dark')
      const data = [
        {
          labels,
          values,
          type: 'pie',
          hole: 0.15,
          marker: {
            colors: ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']
          }
        }
      ]
      const layout: any = {
        autosize: true,
        title: 'Inventory by Category (Quantity)',
        margin: { t: 40, b: 20, l: 20, r: 20 }
      }
      if (isDark) {
        layout.paper_bgcolor = '#1f2937'
        layout.plot_bgcolor = '#1f2937'
        layout.font = { color: '#e5e7eb' }
      }
      // @ts-ignore
      Plotly.newPlot(chartRef.current, data, layout, { responsive: true })
    })
  }, [items])

  // Generate bar chart for top items by quantity
  useEffect(() => {
    if (!categoryChartRef.current || items.length === 0) return
    
    const topItems = items
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    const names = topItems.map((i) => i.name.substring(0, 20))
    const quantities = topItems.map((i) => i.quantity)
    const costs = topItems.map((i) => i.unit_cost || 0)

    import('plotly.js-basic-dist').then((Plotly) => {
      const isDark = document.documentElement.classList.contains('dark')
      const data = [
        {
          x: names,
          y: quantities,
          name: 'Quantity',
          type: 'bar',
          marker: { color: '#3b82f6' }
        }
      ]
      const layout: any = {
        autosize: true,
        title: 'Top 10 Items by Quantity',
        xaxis: { automargin: true },
        margin: { b: 80, t: 40, l: 40, r: 20 }
      }
      if (isDark) {
        layout.paper_bgcolor = '#1f2937'
        layout.plot_bgcolor = '#1f2937'
        layout.font = { color: '#e5e7eb' }
      }
      // @ts-ignore
      Plotly.newPlot(categoryChartRef.current, data, layout, { responsive: true })
    })
  }, [items])

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(items.map((i) => i.category))]
  
  const stats = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    totalValue: items.reduce((sum, i) => sum + (i.quantity * (i.unit_cost || 0)), 0),
    categories: categories.length
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
          <div className="text-3xl font-bold text-sky-600">{stats.totalItems}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique SKUs</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantity</p>
          <div className="text-3xl font-bold text-emerald-600">{stats.totalQuantity.toLocaleString()}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Units in stock</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <div className="text-3xl font-bold text-amber-600">KES {(stats.totalValue / 1000000).toFixed(1)}M</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inventory value</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
          <div className="text-3xl font-bold text-purple-600">{stats.categories}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Item types</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div ref={chartRef} />
        </div>
        <div className="card">
          <div ref={categoryChartRef} />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">Inventory Items</h2>
          <div className="space-x-2 w-full sm:w-auto">
            <button onClick={() => setShowAnalysis(true)} className="px-4 py-2 bg-sky-600 text-white rounded shadow hover:opacity-90 text-sm sm:text-base">Analyze</button>
            <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-sky-600 text-sky-600 rounded shadow text-sm sm:text-base">Import CSV</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory(null)}
              className={`px-3 py-1 rounded text-sm ${
                !filterCategory ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded text-sm ${
                  filterCategory === cat ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-700 dark:text-gray-300 font-semibold">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Total Value</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-600">
              {filteredItems.length > 0 ? (
                filteredItems.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{it.sku}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{it.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs">
                        {it.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{it.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">KES {(it.unit_cost || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">KES {(it.quantity * (it.unit_cost || 0)).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No items found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-11/12 md:w-3/4 p-4 relative max-h-[80vh] overflow-auto">
            <button onClick={() => setShowAnalysis(false)} aria-label="Close analysis" className="absolute right-3 top-3 text-gray-500 dark:text-gray-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Inventory Analysis</h3>
              <div className="space-x-2">
                <button onClick={() => {downloadCSV(items)}} className="px-3 py-1 bg-sky-600 text-white rounded">Download CSV</button>
                <button onClick={() => {exportAnalysisPDF()}} className="px-3 py-1 bg-gray-700 text-white rounded">Export PDF</button>
              </div>
            </div>
            <InventoryAnalysis items={items} />
          </div>
        </div>
      )}
    </div>
  )
}

function downloadCSV(items: any[]) {
  const headers = ['sku','name','category','quantity','unit_cost']
  const rows = items.map(it => headers.map(h => JSON.stringify(it[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'inventory.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function exportAnalysisPDF() {
  // capture modal content and charts to PDF
  const el = document.querySelector('.fixed .card') as HTMLElement
  if (!el) return alert('Nothing to export')
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).jsPDF
  const canvas = await html2canvas(el, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgProps = (pdf as any).getImageProperties(imgData)
  const imgWidth = pageWidth - 40
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width
  pdf.text('Inventory Analysis Report', 40, 40)
  pdf.addImage(imgData, 'PNG', 20, 60, imgWidth, imgHeight)
  pdf.save('inventory-analysis.pdf')
}
