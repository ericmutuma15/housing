import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents } from "react-leaflet"
import { fetchUnits } from "../api"
import "leaflet/dist/leaflet.css"

export default function GIS() {
  const [units, setUnits] = useState<any[]>([])

  useEffect(() => {
    fetchUnits().then(setUnits)
  }, [])

  // Kenya bbox
  const KENYA = { minLon: 33.5, maxLon: 41.9, minLat: -4.7, maxLat: 4.6 }

  const [selected, setSelected] = useState<any | null>(null)

  const markers = units
    .map((u) => {
      try {
        const geo = JSON.parse(u.geo_location)
        if (geo && geo.type === "Point") {
          const lon = geo.coordinates[0]
          const lat = geo.coordinates[1]
          // filter out-of-range coords
          if (lon < KENYA.minLon || lon > KENYA.maxLon || lat < KENYA.minLat || lat > KENYA.maxLat) return null
          return { id: u.id, coords: [lat, lon], status: u.status, unit_type: u.unit_type, build_year: u.build_year, beneficiaries: u.beneficiaries }
        }
      } catch (e) {
        return null
      }
      return null
    })
    .filter(Boolean)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">GIS Dashboard</h2>
      <div className="card" style={{ height: 600 }}>
        <MapContainer center={[0.0, 37.0]} zoom={6} style={{ height: "100%" }}>
          <TileLayer
            url={
              document?.documentElement?.classList?.contains('dark')
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />
          {markers.map((m: any) => (
            <CircleMarker
              key={m.id}
              center={m.coords as [number, number]}
              radius={8}
              pathOptions={{ color: m.status === "occupied" ? "#16a34a" : "#ef4444", weight: 1, fillOpacity: 0.9 }}
              eventHandlers={{
                click: () => setSelected(m),
              }}
            >
              <Popup>
                <div className="font-medium">Unit {m.id}</div>
                <div className="text-sm text-gray-600">Status: {m.status}</div>
                <div className="text-sm text-gray-600">Type: {m.unit_type}</div>
                <div className="text-sm text-gray-600">Built: {m.build_year}</div>
                <div className="text-sm text-gray-600">Beneficiaries: {m.beneficiaries}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {selected && (
        <div className="mt-4 card">
          <h3 className="text-lg font-medium">Unit preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div><strong>ID:</strong> {selected.id}</div>
            <div><strong>Status:</strong> {selected.status}</div>
            <div><strong>Type:</strong> {selected.unit_type}</div>
            <div><strong>Build year:</strong> {selected.build_year}</div>
            <div><strong>Beneficiaries:</strong> {selected.beneficiaries}</div>
            <div><button onClick={() => setSelected(null)} className="px-3 py-1 bg-sky-600 text-white rounded">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
