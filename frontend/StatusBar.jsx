// src/components/StatusBar.jsx
// Shows: online/offline indicator, WebSocket status, Faker controls
// Add this to DashboardPage or ParallelViewPage header

import { useState } from "react";

const API_BASE = "http://localhost:3001/api";

export default function StatusBar({ isOnline, wsStatus, isSyncing, pendingCount, onResourcesUpdate }) {
  const [fakerRunning, setFakerRunning] = useState(false);
  const [fakerLoading, setFakerLoading] = useState(false);

  async function toggleFaker() {
    setFakerLoading(true);
    try {
      const endpoint = fakerRunning ? "/api/faker/stop" : "/api/faker/start";
      const res = await fetch(`http://localhost:3001${endpoint}`);
      const data = await res.json();
      setFakerRunning(data.status === "started" || data.status === "already_running");
    } catch {
      console.error("Faker toggle failed");
    }
    setFakerLoading(false);
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      padding: "6px 16px", background: "rgba(255,255,255,0.7)",
      borderBottom: "1px solid #e5e7eb", fontSize: 12,
    }}>
      {/* Online/Offline */}
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: isOnline ? "#22c55e" : "#ef4444",
          display: "inline-block",
          boxShadow: isOnline ? "0 0 0 2px rgba(34,197,94,0.3)" : "none",
        }} />
        <span style={{ color: isOnline ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </span>

      {/* Pending sync */}
      {!isOnline && pendingCount > 0 && (
        <span style={{ color: "#d97706", fontWeight: 600 }}>
          ⏳ {pendingCount} operații în așteptare
        </span>
      )}

      {/* Syncing */}
      {isSyncing && (
        <span style={{ color: "#2563eb", fontWeight: 600 }}>
          🔄 Sincronizare...
        </span>
      )}

      {/* WebSocket */}
      <span style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: wsStatus === "connected" ? "#3b82f6" : "#9ca3af",
          display: "inline-block",
        }} />
        <span style={{ color: "#6b7280" }}>
          WS: {wsStatus}
        </span>
      </span>

      {/* Faker control */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#9ca3af" }}>Auto-generate:</span>
        <button
          onClick={toggleFaker}
          disabled={fakerLoading || !isOnline}
          style={{
            padding: "4px 12px", borderRadius: 99, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 700,
            background: fakerRunning ? "#fee2e2" : "#ecfdf5",
            color: fakerRunning ? "#dc2626" : "#16a34a",
            opacity: fakerLoading || !isOnline ? 0.5 : 1,
          }}>
          {fakerLoading ? "..." : fakerRunning ? "⏹ Stop" : "▶ Start"}
        </button>
        {fakerRunning && (
          <span style={{ color: "#10b981", fontWeight: 600, fontSize: 11 }}>
            🟢 Generare activă
          </span>
        )}
      </div>
    </div>
  );
}
