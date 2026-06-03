// src/pages/DashboardPage.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BG = { backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center" };
const DEPT_COLORS = { IT: "#22c55e", Sales: "#3b82f6", HR: "#ec4899", Management: "#f97316", Toate: "#8b5cf6" };
const TYPE_COLORS = { Video: "#22c55e", Quiz: "#3b82f6", Course: "#f97316", Event: "#f59e0b" };
const TYPE_ICONS  = { Video: "▶", Quiz: "?", Course: "📖", Event: "📅" };

function StatCard({ icon, value, label, gradient }) {
  return (
    <div style={{ background: gradient, borderRadius: 16, padding: "1.25rem 1.5rem", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function PieChart({ resources }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    const deptCount = {};
    resources.forEach(r => { deptCount[r.department] = (deptCount[r.department] || 0) + 1; });
    const labels = Object.keys(deptCount);
    const data   = Object.values(deptCount);
    const colors = labels.map(l => DEPT_COLORS[l] || "#6b7280");
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: "pie",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: "#fff" }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
    return () => chartRef.current?.destroy();
  }, [resources]);
  return <div style={{ position: "relative", height: 200 }}><canvas ref={canvasRef} /></div>;
}

function BarChart({ resources }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    const typeCount = {};
    resources.forEach(r => { typeCount[r.type] = (typeCount[r.type] || 0) + 1; });
    const labels = Object.keys(typeCount);
    const data   = Object.values(typeCount);
    const colors = labels.map(l => TYPE_COLORS[l] || "#6b7280");
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: "bar",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 6, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [resources]);
  return <div style={{ position: "relative", height: 200 }}><canvas ref={canvasRef} /></div>;
}

export default function DashboardPage({ resources, onLogout }) {
  const navigate = useNavigate();
  const totalViews     = resources.reduce((s, r) => s + r.views, 0);
  const avgRating      = resources.length ? (resources.reduce((s, r) => s + r.rating, 0) / resources.length).toFixed(1) : "0.0";
  const deptCount      = resources.reduce((acc, r) => { acc[r.department] = (acc[r.department] || 0) + 1; return acc; }, {});
  const mostActiveDept = Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const topRated       = [...resources].sort((a, b) => b.rating - a.rating).slice(0, 5);

  useEffect(() => {
    if (window.Chart) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const stats = [
    { icon: "🗂️", value: resources.length,            label: "Total Resources",  gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
    { icon: "⭐", value: avgRating,                    label: "Average Rating",   gradient: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { icon: "👁️", value: totalViews.toLocaleString(), label: "Total Views",      gradient: "linear-gradient(135deg,#a855f7,#7c3aed)" },
    { icon: "🏢", value: mostActiveDept,               label: "Most Active Dept", gradient: "linear-gradient(135deg,#f97316,#ea580c)" },
  ];

  return (
    <div className="flex min-h-screen relative" style={BG}>
      <div className="absolute inset-0 bg-white/30" />

      {/* Sidebar */}
      <aside className="relative z-10 w-48 bg-white/60 backdrop-blur border-r border-green-100 flex flex-col py-6 px-4 gap-2">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white overflow-hidden">
            <img src="/assets/logo-leaf.png" alt="Logo" className="w-9 h-9 object-contain"
              onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        </div>

       <button
  onClick={() => navigate("/admin-home")}
  className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
>
  🏠 Home
</button>

<button
  className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-green-400 text-white"
>
  📊 Dashboard
</button>

<button
  onClick={() => navigate("/services")}
  className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
>
  🗂️ Services
</button>

<button
  onClick={() => navigate("/parallel")}
  className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
>
  ⚡ Parallel View
</button>

<button
  onClick={() => navigate("/upload")}
  className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
>
  📤 Upload
</button>

        <div className="flex-1" />
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            🚪 Log Out
          </button>
          <div className="flex flex-col items-center mt-3 gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
            <span className="text-xs text-gray-500 font-medium">ADMIN</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-5 border-b border-green-100 bg-white/40 backdrop-blur">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Home &gt; Service</p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-4 py-2">
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium text-gray-700">ADMIN ▾</span>
          </div>
        </header>

        <div className="flex-1 px-8 py-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Services Management</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow p-5">
              <h3 className="font-bold text-gray-700 mb-4">🗂️ Department Distribution</h3>
              <PieChart resources={resources} />
            </div>
            <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow p-5">
              <h3 className="font-bold text-gray-700 mb-4">👤 Resource Types</h3>
              <BarChart resources={resources} />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">🏆 Top Rated Resources</h3>
              <button onClick={() => navigate("/services")} className="text-sm text-green-500 hover:underline">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {topRated.map((r, i) => (
                <div key={r.id} onClick={() => navigate(`/services/${r.id}`)}
                  className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#ecfdf5", color: "#10b981" }}>#{i + 1}</span>
                    <span className="text-xs text-gray-400">{TYPE_ICONS[r.type] || "•"}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-xs mb-2 leading-snug">{r.name}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${DEPT_COLORS[r.department]}22`, color: DEPT_COLORS[r.department] }}>
                      {r.department}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${TYPE_COLORS[r.type]}22`, color: TYPE_COLORS[r.type] }}>
                      {r.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 text-xs">{"★".repeat(Math.round(r.rating))}</span>
                    <span className="text-xs text-gray-400">👁 {r.views}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 mt-1">{r.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}