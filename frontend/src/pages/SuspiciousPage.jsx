// src/pages/SuspiciousPage.jsx
// GOLD CHALLENGE: Admin can view suspicious users
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../hooks/Cookies";

const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";
const BG = { backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center" };

export default function SuspiciousPage({ onLogout }) {
  const navigate   = useNavigate();
  const sessionId  = getCookie("ws_session_id");
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/logs/suspicious`, {
      headers: { "x-session-id": sessionId },
    })
      .then(r => r.json())
      .then(data => { setUsers(data.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  async function resolve(userId) {
    await fetch(`${API_BASE}/logs/suspicious/${userId}/resolve`, {
      method: "PUT",
      headers: { "x-session-id": sessionId },
    });
    setUsers(prev => prev.filter(u => u.userId !== userId));
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden relative" style={BG}>
      <div className="absolute inset-0 bg-white/30" />

      {/* Sidebar */}
      <aside className="relative z-10 w-48 bg-white/60 backdrop-blur border-r border-green-100 flex flex-col py-6 px-4 gap-2 flex-shrink-0">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white overflow-hidden">
            <img src="/assets/logo-leaf.png" alt="Logo" className="w-9 h-9 object-contain" onError={e => e.currentTarget.style.display="none"} />
          </div>
        </div>
        <button onClick={() => navigate("/admin-home")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">🏠 Home</button>
        <button onClick={() => navigate("/dashboard")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">📊 Dashboard</button>
        <button onClick={() => navigate("/services")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">🗂️ Services</button>
        <button onClick={() => navigate("/chat")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">💬 Chat</button>
        <button className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-red-400 text-white">🚨 Suspicious</button>
        <div className="flex-1" />
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onLogout} className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors">🚪 Log Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between px-8 py-5 border-b border-green-100 bg-white/40 backdrop-blur flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🚨 Suspicious Users</h1>
            <p className="text-xs text-gray-400">Useri cu comportament malițios detectat automat</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold">
            {users.length} activi
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">⏳ Se încarcă...</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
              <span className="text-4xl">✅</span>
              <p className="text-sm font-medium">Niciun user suspicios activ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map(u => (
                <div key={u.id} className="bg-white/80 backdrop-blur rounded-2xl border border-red-100 p-5 flex items-start justify-between shadow-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-bold text-gray-800">{u.email}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Suspicios</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">Motiv:</span> {u.reason}
                    </p>
                    <p className="text-xs text-gray-400">
                      Flagat la: {new Date(u.flaggedAt).toLocaleString("ro-RO")}
                    </p>
                  </div>
                  <button onClick={() => resolve(u.userId)}
                    className="px-4 py-2 rounded-xl bg-green-400 text-white text-sm font-semibold hover:bg-green-500 transition-colors flex-shrink-0">
                    ✓ Rezolvă
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}