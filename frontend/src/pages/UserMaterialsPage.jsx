// src/pages/UserMaterialsPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
  Video:  { color: "#7c3aed", bg: "#f5f3ff", icon: "▶", label: "Video" },
  Quiz:   { color: "#2563eb", bg: "#eff6ff",  icon: "❓", label: "Quiz" },
  Course: { color: "#d97706", bg: "#fffbeb",  icon: "📖", label: "Course" },
  Event:  { color: "#059669", bg: "#ecfdf5",  icon: "📅", label: "Event" },
};

const DEPT_META = {
  IT:         { color: "#2563eb", bg: "#eff6ff" },
  Sales:      { color: "#ea580c", bg: "#fff7ed" },
  HR:         { color: "#db2777", bg: "#fdf2f8" },
  Management: { color: "#7c3aed", bg: "#f5f3ff" },
  Toate:      { color: "#6b7280", bg: "#f9fafb" },
};

const TYPE_FILTERS = ["All", "Video", "Quiz", "Course", "Event"];

function ResourceDetailModal({ resource, onClose, onMarkViewed, isViewed }) {
  const tm = TYPE_META[resource.type] || { color: "#6b7280", bg: "#f9fafb", icon: "•" };
  const dm = DEPT_META[resource.department] || { color: "#6b7280", bg: "#f9fafb" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${dm.color}, ${tm.color})` }} />
        <div style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: dm.bg, color: dm.color }}>{resource.department}</span>
            <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: tm.bg, color: tm.color }}>{tm.icon} {resource.type}</span>
            {isViewed && <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: "#ecfdf5", color: "#059669" }}>✓ Vizualizat</span>}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8, lineHeight: 1.3 }}>{resource.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
            <span style={{ color: "#f59e0b", fontSize: 18 }}>{"★".repeat(Math.round(resource.rating))}{"☆".repeat(5 - Math.round(resource.rating))}</span>
            <span style={{ fontWeight: 700, color: "#374151" }}>{resource.rating}</span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span style={{ color: "#9ca3af", fontSize: 13 }}>👁 {resource.views} vizualizări</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
            {[
              { label: "Condiție deblocare", value: resource.unlockCondition, icon: "🔓" },
              { label: "Data adăugată",      value: resource.dateAdded,       icon: "📅" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background: "#f9fafb", borderRadius: 12, padding: "0.875rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{icon} {value}</p>
              </div>
            ))}
          </div>
          <div style={{ background: `linear-gradient(135deg, ${dm.bg}, ${tm.bg})`, borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem", border: `1px solid ${tm.color}22` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: tm.color, marginBottom: 6 }}>{tm.icon} Conținut {resource.type}</p>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              {resource.type === "Video"  && "Urmărește acest videoclip pentru a înțelege conceptele cheie. Durată estimată: 15-20 minute."}
              {resource.type === "Quiz"   && "Testează-ți cunoștințele cu acest quiz. Răspunde la toate întrebările pentru a obține scorul final."}
              {resource.type === "Course" && "Parcurge modulele acestui curs în ordine. Fiecare modul conține materiale și exerciții practice."}
              {resource.type === "Event"  && "Înregistrează-te la acest eveniment pentru a participa. Verifică data și locația în detalii."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {!isViewed ? (
              <button onClick={() => { onMarkViewed(resource.id); onClose(); }}
                style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                ✓ Marchează ca vizualizat
              </button>
            ) : (
              <div style={{ flex: 1, padding: "11px 0", borderRadius: 12, background: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: 14, textAlign: "center" }}>
                ✓ Deja vizualizat
              </div>
            )}
            <button onClick={onClose}
              style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Închide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, isViewed, onClick }) {
  const tm = TYPE_META[resource.type] || { color: "#6b7280", bg: "#f9fafb", icon: "•" };
  const dm = DEPT_META[resource.department] || { color: "#6b7280", bg: "#f9fafb" };
  const [hovered, setHovered] = useState(false);

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${hovered ? tm.color : "#f0f0f0"}`, padding: "1.25rem", cursor: "pointer", transition: "all 0.18s", boxShadow: hovered ? `0 8px 24px ${tm.color}22` : "0 2px 8px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-2px)" : "none", position: "relative", opacity: isViewed ? 0.85 : 1 }}>
      {isViewed && (
        <div style={{ position: "absolute", top: 12, right: 12, background: "#ecfdf5", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#059669" }}>✓ Vizualizat</div>
      )}
      <div style={{ width: 40, height: 40, borderRadius: 12, background: tm.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{tm.icon}</div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 8, lineHeight: 1.4, paddingRight: isViewed ? 60 : 0 }}>{resource.name}</h3>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: dm.bg, color: dm.color }}>{resource.department}</span>
        <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: tm.bg, color: tm.color }}>{resource.type}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#f59e0b", fontSize: 13 }}>{"★".repeat(Math.round(resource.rating))}</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>👁 {resource.views}</span>
      </div>
    </div>
  );
}

export default function UserMaterialsPage({ resources, username, department, onLogout }) {
  const navigate = useNavigate();
  const [viewed, setViewed] = useState(new Set());
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const myResources = resources.filter(r => r.department === department || r.department === "Toate");
  const filtered = myResources
    .filter(r => typeFilter === "All" || r.type === typeFilter)
    .filter(r => !search.trim() || r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  const viewedCount = myResources.filter(r => viewed.has(r.id)).length;
  const progress = myResources.length ? Math.round((viewedCount / myResources.length) * 100) : 0;

  function markViewed(id) { setViewed(prev => new Set([...prev, id])); }

  const dm = DEPT_META[department] || { color: "#6b7280", bg: "#f9fafb" };

  const sidebarBtn = (label, onClick, active = false) => (
    <button onClick={onClick}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "none", textAlign: "left", fontSize: 13, fontWeight: active ? 700 : 500, background: active ? "#22c55e" : "transparent", color: active ? "#fff" : "#6b7280", cursor: "pointer" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#16a34a"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; } }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", overflow: "hidden", maxWidth: "100vw" }} className="materials-root">
      {/* Sidebar */}
      <aside className="materials-sidebar" style={{ width: 192, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRight: "1px solid #e5e7eb", display: window.innerWidth < 768 ? "none" : "flex", width: window.innerWidth < 768 ? 0 : 192, flexDirection: "column", padding: "1.5rem 1rem", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #60a5fa", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/assets/logo-leaf.png" alt="Logo" style={{ width: 36, height: 36, objectFit: "contain" }} onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        </div>

        {sidebarBtn("🧭 Wellness", () => navigate("/welcome"))}
        {sidebarBtn("📚 Materialele mele", () => navigate("/materials"), true)}
        {sidebarBtn("💬 Chat", () => navigate("/chat"))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
          <button onClick={onLogout}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "none", textAlign: "left", fontSize: 12, background: "transparent", color: "#9ca3af", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}>
            🚪 Log Out
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12, gap: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: dm.bg, border: `2px solid ${dm.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{username}</span>
            <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 99, background: dm.bg, color: dm.color, fontWeight: 600 }}>{department}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <header style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e5e7eb", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 2 }}>Materialele mele</h1>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Departament: <span style={{ color: dm.color, fontWeight: 600 }}>{department}</span></p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 99, padding: "8px 16px" }}>
            <span style={{ fontSize: 14 }}>👤</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{username}</span>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
          {/* Progress card */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>Progresul tău</p>
                <p style={{ fontSize: 12, color: "#9ca3af" }}>{viewedCount} din {myResources.length} materiale vizualizate</p>
              </div>
              <span style={{ fontSize: 28, fontWeight: 900, color: progress === 100 ? "#059669" : dm.color }}>{progress}%</span>
            </div>
            <div style={{ height: 10, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "linear-gradient(90deg,#10b981,#059669)" : `linear-gradient(90deg,${dm.color}cc,${dm.color})`, borderRadius: 99, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {["Video","Quiz","Course","Event"].map(t => {
                const total = myResources.filter(r => r.type === t).length;
                const done  = myResources.filter(r => r.type === t && viewed.has(r.id)).length;
                if (!total) return null;
                const tm = TYPE_META[t];
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 13 }}>{tm.icon}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{done}/{total}</span>
                    <span style={{ fontSize: 11, color: tm.color, fontWeight: 600 }}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 14px", flex: "1", minWidth: 180, maxWidth: 280 }}>
              <span style={{ color: "#9ca3af", fontSize: 14 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută materiale..."
                style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TYPE_FILTERS.map(f => {
                const active = typeFilter === f;
                const tm = f !== "All" ? TYPE_META[f] : null;
                return (
                  <button key={f} onClick={() => setTypeFilter(f)}
                    style={{ padding: "7px 14px", borderRadius: 99, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", borderColor: active ? (tm?.color || "#22c55e") : "#e5e7eb", background: active ? (tm?.bg || "#f0fdf4") : "#fff", color: active ? (tm?.color || "#16a34a") : "#6b7280" }}>
                    {f !== "All" && TYPE_META[f].icon + " "}{f}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>{filtered.length} materiale</span>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Niciun material găsit</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {filtered.map(r => (
                <ResourceCard key={r.id} resource={r} isViewed={viewed.has(r.id)} onClick={() => setSelected(r)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <ResourceDetailModal resource={selected} isViewed={viewed.has(selected.id)} onMarkViewed={markViewed} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}