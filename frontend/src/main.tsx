import React from "react"
import "./index.css"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import App from "./App"
import Analysis from "./pages/Analysis"
import GIS from "./pages/GIS"
import Inventory from "./pages/Inventory"

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
