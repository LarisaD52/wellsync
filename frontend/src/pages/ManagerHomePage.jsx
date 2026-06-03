// src/pages/ManagerHomePage.jsx
import { useNavigate } from "react-router-dom";

export default function ManagerHomePage({ username = "Manager", resources = [], onLogout }) {
  const navigate = useNavigate();

  const deptStats = resources.reduce((acc, r) => {
    const dept = r.department || r.departament || "Other";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const totalResources = resources.length;
  const totalViews     = resources.reduce((s, r) => s + (r.views || 0), 0);
  const avgRating      = resources.length
    ? (resources.reduce((s, r) => s + (r.rating || 0), 0) / resources.length).toFixed(1)
    : "0.0";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)" }}>
      {/* Sidebar */}
      <aside style={{ width: 200, background: "rgba(255,255,255,0.85)", borderRight: "1px solid #e9d5ff", display: "flex", flexDirection: "column", padding: "24px 16px", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 20 }}>
            M
          </div>
          <span style={{ marginTop: 8, fontWeight: 600, fontSize: 13, color: "#7c3aed" }}>MANAGER</span>
        </div>

        <button onClick={() => navigate("/manager-home")}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "#7c3aed", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
          🏠 Home
        </button>
        <button onClick={() => navigate("/materials")}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#6b7280", fontWeight: 500, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
          📚 Materials
        </button>
        <button onClick={() => navigate("/chat")}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#6b7280", fontWeight: 500, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
          💬 Chat
        </button>

        <div style={{ flex: 1 }} />
        <button onClick={onLogout}
          style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
          🚪 Log Out
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
          {username}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <header style={{ padding: "20px 32px", borderBottom: "1px solid #e9d5ff", background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1f2937" }}>Manager Dashboard</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Welcome back, {username}</p>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 20, background: "#ede9fe", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
            MANAGER ROLE
          </span>
        </header>

        <div style={{ padding: 32 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Total Resources", value: totalResources, icon: "📚", color: "#7c3aed" },
              { label: "Total Views",     value: totalViews,     icon: "👁️", color: "#0ea5e9" },
              { label: "Avg Rating",      value: avgRating + " ⭐", icon: "⭐", color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "20px 24px", border: "1px solid #e9d5ff" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Department breakdown */}
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 16 }}>Resources by Department</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
            {Object.entries(deptStats).length > 0 ? Object.entries(deptStats).map(([dept, count]) => (
              <div key={dept} style={{ background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #e9d5ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 500, color: "#374151" }}>{dept}</span>
                <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: 18 }}>{count}</span>
              </div>
            )) : (
              <div style={{ gridColumn: "span 2", padding: 24, textAlign: "center", color: "#9ca3af", background: "white", borderRadius: 12, border: "1px solid #e9d5ff" }}>
                No resources loaded yet
              </div>
            )}
          </div>

          {/* Permissions */}
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 16 }}>Your Permissions</h2>
          <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #e9d5ff" }}>
            {["READ_RESOURCES", "CREATE_RESOURCE", "UPDATE_RESOURCE", "APPROVE_RESOURCE", "VIEW_STATS", "VIEW_DEPARTMENT"].map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "#374151" }}>{p}</span>
              </div>
            ))}
            {["DELETE_RESOURCE", "MANAGE_USERS", "VIEW_LOGS"].map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>✗</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "#9ca3af" }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
