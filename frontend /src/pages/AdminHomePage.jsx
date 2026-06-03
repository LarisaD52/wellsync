import { useNavigate } from "react-router-dom";

const BG = {
  backgroundImage: "url('/assets/bg-leaves.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const SHORTCUTS = [
  { icon: "📊", title: "Dashboard", desc: "Statistici, grafice departamente și tipuri de resurse", path: "/dashboard", gradient: "linear-gradient(135deg,#22c55e,#16a34a)", shadow: "rgba(34,197,94,0.3)" },
  { icon: "🗂️", title: "Services", desc: "Gestionează toate resursele — adaugă, editează, șterge", path: "/services", gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "rgba(59,130,246,0.3)" },
  { icon: "⚡", title: "Parallel View", desc: "Tabel + grafice live în același ecran", path: "/parallel", gradient: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.3)" },
  { icon: "🚨", title: "Suspicious Users", desc: "Useri cu comportament malițios detectat automat", path: "/suspicious", gradient: "linear-gradient(135deg,#ef4444,#dc2626)", shadow: "rgba(239,68,68,0.3)" },
];

const QUICK_STATS = [
  { icon: "🗂️", label: "Pagini admin", value: "4" },
  { icon: "👥", label: "Rol",           value: "Admin" },
  { icon: "🔧", label: "CRUD complet",  value: "✓" },
  { icon: "📈", label: "Grafice live",  value: "✓" },
];

export default function AdminHomePage({ username = "Admin", resources = [], onLogout }) {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bună dimineața" : hour < 18 ? "Bună ziua" : "Bună seara";

  return (
    <div className="flex min-h-screen relative" style={BG}>
      <div className="absolute inset-0 bg-white/30" />

      <aside className="relative z-10 w-48 bg-white/60 backdrop-blur border-r border-green-100 flex flex-col py-6 px-4 gap-2">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white overflow-hidden">
            <img src="/assets/logo-leaf.png" alt="Logo" className="w-9 h-9 object-contain"
              onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        </div>

        <button className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-green-400 text-white">🏠 Home</button>
        <button onClick={() => navigate("/dashboard")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">📊 Dashboard</button>
        <button onClick={() => navigate("/services")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">🗂️ Services</button>
        <button onClick={() => navigate("/parallel")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">⚡ Parallel View</button>
        <button onClick={() => navigate("/upload")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">📁 Upload</button>
        <button onClick={() => navigate("/chat")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">💬 Chat</button>
        <button onClick={() => navigate("/suspicious")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">🚨 Suspicious</button>

        <div className="flex-1" />
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onLogout} className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors">🚪 Log Out</button>
          <div className="flex flex-col items-center mt-3 gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
            <span className="text-xs text-gray-500 font-medium">{username.toUpperCase()}</span>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-5 border-b border-green-100 bg-white/40 backdrop-blur">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Home</h1>
            <p className="text-xs text-gray-400">Panou de control principal</p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-4 py-2">
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium text-gray-700">{username.toUpperCase()} ▾</span>
          </div>
        </header>

        <div className="flex-1 px-8 py-8">
          <div className="rounded-3xl p-8 mb-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)", border: "1.5px solid #6ee7b7" }}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
            <div className="absolute -bottom-6 right-24 w-24 h-24 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #059669, transparent)" }} />
            <div className="relative z-10">
              <p className="text-sm font-semibold text-green-600 mb-1 tracking-wide uppercase">
                {new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h2 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                {greeting}, {username}! 👋
              </h2>
              <p className="text-gray-600 text-base max-w-lg">
                Ai <strong>{resources.length}</strong> resurse în platformă. Folosește shortcut-urile de mai jos pentru a naviga rapid.
              </p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => navigate("/services")}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-105 active:scale-100"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}>
                  + Adaugă resursă
                </button>
                <button onClick={() => navigate("/dashboard")}
                  className="px-5 py-2.5 rounded-xl text-green-700 text-sm font-bold bg-white/80 border border-green-200 hover:bg-white transition-colors">
                  Vezi statistici →
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {QUICK_STATS.map(s => (
              <div key={s.label} className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  <p className="text-lg font-black text-gray-800">{s.label === "Total resurse" ? resources.length : s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base font-bold text-gray-700 mb-4">Navigare rapidă</h3>
          <div className="grid grid-cols-2 gap-5">
            {SHORTCUTS.map(s => (
              <button key={s.path} onClick={() => navigate(s.path)}
                className="text-left rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-100 group"
                style={{ background: "#fff", border: "1.5px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${s.shadow}`; e.currentTarget.style.borderColor = "transparent"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "#f0f0f0"; }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: s.gradient }}>
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800 text-base">{s.title}</h4>
                      <span className="text-gray-300 group-hover:translate-x-1 transition-transform text-lg">→</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}