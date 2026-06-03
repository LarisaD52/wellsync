// src/pages/ParallelViewPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ResourceModal from "../components/ResourceModal";
import DeleteModal from "../components/DeleteModal";

const BG = { backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center" };
const DEPT_COLORS = { IT: "#22c55e", Sales: "#3b82f6", HR: "#ec4899", Management: "#f97316", Toate: "#8b5cf6" };
const TYPE_COLORS = { Video: "#22c55e", Quiz: "#3b82f6", Course: "#f97316", Event: "#f59e0b" };
const PAGE_SIZE = 8;

//Mini charts
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
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [resources]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={canvasRef} /></div>;
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
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [resources]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={canvasRef} /></div>;
}

function RatingChart({ resources }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    const top = [...resources].sort((a, b) => b.rating - a.rating).slice(0, 6);
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: top.map(r => r.name.length > 14 ? r.name.slice(0, 14) + "…" : r.name),
        datasets: [{ data: top.map(r => r.rating), backgroundColor: "#10b981", borderRadius: 6, borderSkipped: false }],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { min: 0, max: 5, grid: { display: false } }, y: { grid: { display: false } } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [resources]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={canvasRef} /></div>;
}

//Stat pill 
function StatPill({ icon, value, label, color }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: "10px 14px", color: "#fff", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, opacity: 0.85 }}>{label}</div>
      </div>
    </div>
  );
}

// Main component 
export default function ParallelViewPage({ resources, onAdd, onUpdate, onDelete, onLogout }) {
  const navigate = useNavigate();

  // table state
  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState("");
  const [modalMode, setModalMode]         = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // load Chart.js once
  useEffect(() => {
    if (window.Chart) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // derived stats
  const totalViews     = resources.reduce((s, r) => s + r.views, 0);
  const avgRating      = resources.length
    ? (resources.reduce((s, r) => s + r.rating, 0) / resources.length).toFixed(1)
    : "0.0";
  const deptCount      = resources.reduce((acc, r) => { acc[r.department] = (acc[r.department] || 0) + 1; return acc; }, {});
  const mostActiveDept = Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  // filtered + paginated
  const filtered   = resources.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave(data) {
    if (modalMode === "add") onAdd(data);
    else onUpdate({ ...data, id: selectedResource.id });
    setModalMode(null); setSelectedResource(null);
  }
  function handleDelete() { onDelete(deleteTarget.id); setDeleteTarget(null); }

  return (
    <div className="flex h-screen overflow-hidden relative" style={BG}>
      <div className="absolute inset-0 bg-white/25" />

      {/* ── Sidebar ── */}
      <aside className="relative z-10 w-44 bg-white/60 backdrop-blur border-r border-green-100 flex flex-col py-5 px-3 gap-2 flex-shrink-0">
        <div className="flex justify-center mb-4">
          <div className="w-11 h-11 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white overflow-hidden">
            <img src="/assets/logo-leaf.png" alt="Logo" className="w-8 h-8 object-contain" onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        </div>
        <button onClick={() => navigate("/admin-home")} className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-600 hover:bg-green-50 transition-colors">🏠 Home</button>
<button onClick={() => navigate("/dashboard")} className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-600 hover:bg-green-50 transition-colors">📊 Dashboard</button>
<button onClick={() => navigate("/services")} className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-600 hover:bg-green-50 transition-colors">🗂️ Services</button>
<button className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold bg-green-400 text-white">⚡ Parallel View</button>
<button onClick={() => navigate("/upload")} className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-gray-600 hover:bg-green-50 transition-colors">📤 Upload</button>
 <div className="flex-1" />
        <div className="border-t border-gray-100 pt-3">
          <button onClick={onLogout} className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors">🚪 Log Out</button>
          <div className="flex flex-col items-center mt-2 gap-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
            <span className="text-xs text-gray-500 font-medium">ADMIN</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-green-100 bg-white/40 backdrop-blur flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-800">⚡ Parallel View</h1>
            <p className="text-xs text-gray-400">Table & Charts — live sync</p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-3 py-1.5">
            <span className="text-xs">👤</span>
            <span className="text-xs font-medium text-gray-700">ADMIN ▾</span>
          </div>
        </header>

        {/* Stat pills */}
        <div className="flex gap-3 px-6 py-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.25)" }}>
          <StatPill icon="🗂️" value={resources.length}            label="Resources"  color="linear-gradient(135deg,#22c55e,#16a34a)" />
          <StatPill icon="⭐" value={avgRating}                    label="Avg Rating"  color="linear-gradient(135deg,#3b82f6,#2563eb)" />
          <StatPill icon="👁️" value={totalViews.toLocaleString()} label="Total Views" color="linear-gradient(135deg,#a855f7,#7c3aed)" />
          <StatPill icon="🏢" value={mostActiveDept}               label="Top Dept"    color="linear-gradient(135deg,#f97316,#ea580c)" />
        </div>

        {/*Two parallel panels*/}
        <div className="flex flex-1 gap-4 px-6 pb-6 pt-3 overflow-hidden min-h-0">

          
          <div className="flex-1 flex flex-col bg-white/55 backdrop-blur border border-green-100 rounded-2xl shadow overflow-hidden min-w-0">
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <span className="font-semibold text-gray-700 text-sm">📋 Resources Table</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                  <span className="text-gray-400 text-xs">🔍</span>
                  <input type="text" placeholder="Search..." value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="bg-transparent text-xs outline-none text-gray-700 w-28" />
                </div>
                <button onClick={() => { setModalMode("add"); setSelectedResource(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-400 text-white text-xs font-medium hover:bg-green-500 transition-colors shadow">
                  + Add
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-gray-100 bg-gray-50/90 backdrop-blur">
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Resursă</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Dept</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Tip</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Rating</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No resources found.</td></tr>
                  ) : paginated.map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-green-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/services/${r.id}`)}>
                      <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[140px] truncate">{r.name}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: `${DEPT_COLORS[r.department]}22`, color: DEPT_COLORS[r.department] }}>
                          {r.department}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: `${TYPE_COLORS[r.type]}22`, color: TYPE_COLORS[r.type] }}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-amber-400">{"★".repeat(Math.round(r.rating))}</span>
                        <span className="text-gray-500 ml-1">{r.rating}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setSelectedResource(r); setModalMode("edit"); }}
                            className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">✏️</button>
                          <button onClick={() => setDeleteTarget(r)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0">
              <span className="text-xs text-gray-400">{page} / {totalPages} pages ({filtered.length} items)</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 text-xs">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, page - 2), Math.min(totalPages, page + 1)
                ).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === n ? "bg-green-400 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 text-xs">›</button>
              </div>
            </div>
          </div>

          <div className="w-80 flex flex-col gap-3 overflow-y-auto flex-shrink-0">
            <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow p-4 flex-shrink-0">
              <h3 className="font-bold text-gray-700 text-xs mb-3">🗂️ By Department</h3>
              <PieChart resources={resources} />
            </div>
            <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow p-4 flex-shrink-0">
              <h3 className="font-bold text-gray-700 text-xs mb-3">📊 By Type</h3>
              <BarChart resources={resources} />
            </div>
            <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow p-4 flex-shrink-0">
              <h3 className="font-bold text-gray-700 text-xs mb-3">⭐ Top Rated</h3>
              <RatingChart resources={resources} />
            </div>
          </div>

        </div>
      </main>

      {modalMode && <ResourceModal mode={modalMode} resource={selectedResource} onSave={handleSave} onClose={() => { setModalMode(null); setSelectedResource(null); }} />}
      {deleteTarget && <DeleteModal resource={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}