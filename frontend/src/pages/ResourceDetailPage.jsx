import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ResourceModal from "../components/ResourceModal";

const BG = { backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center" };
const TYPE_COLORS = { Video: "bg-purple-100 text-purple-700", Quiz: "bg-blue-100 text-blue-700", Course: "bg-amber-100 text-amber-700", Event: "bg-green-100 text-green-700" };
const DEPT_COLORS = { IT: "bg-blue-100 text-blue-700", Sales: "bg-orange-100 text-orange-700", HR: "bg-pink-100 text-pink-700", Management: "bg-purple-100 text-purple-700", Toate: "bg-gray-100 text-gray-700" };
const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";

// 1-to-many: Comments section
function CommentsSection({ resourceId }) {
  const [comments, setComments] = useState([]);
  const [stats, setStats]       = useState({ total: 0 });
  const [text, setText]         = useState("");
  const [author, setAuthor]     = useState("");
  const [error, setError]       = useState("");
  const [editId, setEditId]     = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading]   = useState(false);

  async function loadComments() {
    try {
      const res  = await fetch(`${API_BASE}/resources/${resourceId}/comments`);
      const data = await res.json();
      setComments(data.data || []);
      setStats(data.stats || { total: 0 });
    } catch { /* offline */ }
  }

  useEffect(() => { loadComments(); }, [resourceId]); // eslint-disable-line

  async function handleAdd(e) {
    e.preventDefault();
    if (text.trim().length < 2) { setError("Comentariul trebuie să aibă cel puțin 2 caractere."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), author: author.trim() || "anonymous" }),
      });
      if (res.ok) { setText(""); setAuthor(""); loadComments(); }
      else { const d = await res.json(); setError(d.details?.join(", ") || "Eroare la salvare."); }
    } catch { setError("Server offline. Comentariul nu a putut fi salvat."); }
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API_BASE}/resources/${resourceId}/comments/${id}`, { method: "DELETE" });
      loadComments();
    } catch { /* offline */ }
  }

  async function handleEdit(id) {
    if (editText.trim().length < 2) return;
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (res.ok) { setEditId(null); setEditText(""); loadComments(); }
    } catch { /* offline */ }
  }

  return (
    <div className="mt-6 bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-lg">💬 Comentarii</h2>
        <span className="text-sm text-gray-400">{stats.total} comentarii · {stats.authors?.length || 0} autori</span>
      </div>

      {/* Add comment */}
      <form onSubmit={handleAdd} className="px-8 py-5 border-b border-gray-100 flex flex-col gap-3">
        <div className="flex gap-3">
          <input
            type="text" placeholder="Numele tău (opțional)" value={author}
            onChange={e => setAuthor(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
          />
        </div>
        <div className="flex gap-3">
          <textarea
            placeholder="Scrie un comentariu..." value={text}
            onChange={e => { setText(e.target.value); setError(""); }}
            rows={2}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 resize-none"
          />
          <button type="submit" disabled={loading}
            className="px-5 py-2 rounded-xl bg-green-400 text-white text-sm font-semibold hover:bg-green-500 transition-colors self-end disabled:opacity-50">
            {loading ? "..." : "Adaugă"}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </form>

      {/* Comment list */}
      <div className="divide-y divide-gray-50">
        {comments.length === 0 ? (
          <p className="px-8 py-6 text-gray-400 text-sm text-center">Niciun comentariu încă. Fii primul!</p>
        ) : comments.map(c => (
          <div key={c.id} className="px-8 py-4 flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {c.author[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-700">{c.author}</span>
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString("ro-RO")}</span>
                {c.updatedAt && <span className="text-xs text-gray-300">(editat)</span>}
              </div>
              {editId === c.id ? (
                <div className="flex gap-2 mt-1">
                  <textarea value={editText} onChange={e => setEditText(e.target.value)}
                    rows={2} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-green-400 resize-none" />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleEdit(c.id)} className="px-3 py-1 text-xs rounded-lg bg-green-400 text-white hover:bg-green-500">✓</button>
                    <button onClick={() => setEditId(null)} className="px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">{c.text}</p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditId(c.id); setEditText(c.text); }}
                className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 text-xs">✏️</button>
              <button onClick={() => handleDelete(c.id)}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResourceDetailPage({ resources, onUpdate, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const resource = resources.find(r => r.id === parseInt(id));

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={BG}>
        <div className="absolute inset-0 bg-white/30" />
        <div className="relative z-10 text-center bg-white/60 backdrop-blur rounded-2xl p-10">
          <p className="text-2xl mb-4">😕</p>
          <p className="text-gray-500 mb-4">Resource not found.</p>
          <button onClick={() => navigate("/services")} className="px-6 py-2 rounded-xl bg-green-400 text-white">Back to Services</button>
        </div>
      </div>
    );
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(resource.rating) ? "★" : "☆");

  function handleSave(data) { onUpdate({ ...data, id: resource.id }); setEditOpen(false); }
  function handleDelete()   { onDelete(resource.id); navigate("/services"); }

  return (
    <div className="min-h-screen relative" style={BG}>
      <div className="absolute inset-0 bg-white/30" />

      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-green-100 bg-white/40 backdrop-blur">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/services")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors">← Back to Services</button>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-400">Resource Detail</span>
        </div>
        <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-4 py-2">
          <span className="text-sm">👤</span>
          <span className="text-sm font-medium text-gray-700">ADMIN</span>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Resource card */}
        <div className="bg-white/60 backdrop-blur border border-green-100 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${DEPT_COLORS[resource.department] || "bg-gray-100 text-gray-700"}`}>{resource.department}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[resource.type] || "bg-gray-100 text-gray-700"}`}>{resource.type}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{resource.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-amber-400 text-lg">{stars.join("")}</span>
              <span className="font-semibold text-gray-700">{resource.rating}</span>
              <span>·</span>
              <span>👁️ {resource.views} views</span>
            </div>
          </div>

          <div className="px-8 py-6 grid grid-cols-2 gap-6">
            {[
              { label: "Unlock Condition", value: `🔓 ${resource.unlockCondition}` },
              { label: "Date Added",       value: `📅 ${resource.dateAdded}` },
              { label: "Rating",           value: `⭐ ${resource.rating} / 5` },
              { label: "Total Views",      value: `👀 ${resource.views}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">{label}</p>
                <p className="text-gray-800 font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="px-8 py-5 border-t border-gray-100 flex items-center gap-3">
            <button onClick={() => setEditOpen(true)} aria-label="Edit Resource"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow">
              ✏️ Edit Resource
            </button>
            <button onClick={handleDelete} aria-label="Delete Resource"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow">
              🗑️ Delete Resource
            </button>
            <button onClick={() => navigate("/services")}
              className="ml-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              Back to List
            </button>
          </div>
        </div>

        {/* 1-to-many: Comments */}
        <CommentsSection resourceId={resource.id} />
      </div>

      {editOpen && (
        <div data-testid="edit-modal" style={{ display: "block", position: "fixed", inset: 0, zIndex: 100 }}>
          <ResourceModal mode="edit" resource={resource} onSave={handleSave} onClose={() => setEditOpen(false)} />
        </div>
      )}
    </div>
  );
}
