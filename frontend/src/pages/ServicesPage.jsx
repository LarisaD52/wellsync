import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ResourceModal from "../components/ResourceModal";
import DeleteModal from "../components/DeleteModal";

const BG = { backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center" };
const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";
const PAGE_SIZE = 8;

function useInfiniteScroll(search, sessionId) {
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const prefetch              = useRef({});
  const sentinelRef           = useRef(null);
  const observerRef           = useRef(null);

  function buildUrl(p) {
    const q = new URLSearchParams({ page: p, pageSize: PAGE_SIZE });
    if (search) q.set("search", search);
    return `${API_BASE}/resources?${q}`;
  }

  const fetchPage = useCallback(async (p) => {
    const key = buildUrl(p);
    if (prefetch.current[key]) return prefetch.current[key];
    const headers = {};
    if (sessionId) headers["x-session-id"] = sessionId;
    const res = await fetch(key, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    prefetch.current[key] = data;
    return data;
  }, [search, sessionId]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !sessionId) return;
    setLoading(true);
    try {
      const data = await fetchPage(page);
      setItems(prev => page === 1 ? (data.data ?? []) : [...prev, ...(data.data ?? [])]);
      setHasMore(page < (data.pagination?.totalPages ?? 1));
      if (page < (data.pagination?.totalPages ?? 1)) fetchPage(page + 1).catch(() => {});
      setPage(p => p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchPage, sessionId]);

  useEffect(() => {
    setItems([]); setPage(1); setHasMore(true); prefetch.current = {};
  }, [search, sessionId]);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !loading) loadMore();
    }, { threshold: 0.1 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    if (sessionId) { setItems([]); setPage(1); setHasMore(true); }
  }, [sessionId]);

  return { items, loading, hasMore, sentinelRef, setItems };
}

export default function ServicesPage({ resources: localResources, onAdd, onUpdate, onDelete, onLogout, sessionId }) {
  const navigate = useNavigate();
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalMode, setModalMode]         = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [useServer, setUseServer]         = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { items: serverItems, loading, hasMore, sentinelRef, setItems } =
    useInfiniteScroll(debouncedSearch, sessionId);

  useEffect(() => {
    if (!loading && serverItems.length === 0 && !hasMore) setUseServer(false);
  }, [loading, serverItems, hasMore]);

  const displayItems = useServer
    ? serverItems
    : (localResources ?? []).filter(r =>
        !debouncedSearch ||
        r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.department.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

  function handleSave(data) {
    if (modalMode === "add") onAdd(data);
    else onUpdate({ ...data, id: selectedResource.id });
    setItems([]);
    setModalMode(null); setSelectedResource(null);
  }

  function handleDelete() {
    onDelete(deleteTarget.id);
    setItems(prev => prev.filter(r => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden relative" style={BG}>
      <div className="absolute inset-0 bg-white/30" />
      <aside className="relative z-10 w-48 bg-white/60 backdrop-blur border-r border-green-100 flex flex-col py-6 px-4 gap-2 flex-shrink-0">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white overflow-hidden">
            <img src="/assets/logo-leaf.png" alt="WellSync Logo" className="w-9 h-9 object-contain" />
          </div>
        </div>
        <button onClick={() => navigate("/admin-home")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">🏠 Home</button>
        <button onClick={() => navigate("/dashboard")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">📊 Dashboard</button>
        <button className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-green-400 text-white">🗂️ Services</button>
        <button onClick={() => navigate("/parallel")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">⚡ Parallel View</button>
        <button onClick={() => navigate("/upload")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">📤 Upload</button>
        <div className="flex-1" />
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onLogout} className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors">🚪 Log Out</button>
          <div className="flex flex-col items-center mt-3 gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
            <span className="text-xs text-gray-500 font-medium">ADMIN</span>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between px-8 py-5 border-b border-green-100 bg-white/40 backdrop-blur flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Home › Services</p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-4 py-2">
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium text-gray-700">ADMIN ▾</span>
          </div>
        </header>

        <div className="flex-1 px-8 py-6 flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex-shrink-0">Services Management</h2>
          <div className="bg-white/55 backdrop-blur border border-green-100 rounded-2xl shadow flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <span className="font-semibold text-gray-700">
                Services
                {!useServer && <span className="ml-2 text-xs text-amber-500 font-normal">📴 offline mode</span>}
                {useServer && <span className="ml-2 text-xs text-green-500 font-normal">∞ infinite scroll</span>}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-gray-400 text-sm">🔍</span>
                  <input type="text" placeholder="Search..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent text-sm outline-none text-gray-700 w-36" />
                </div>
                <button onClick={() => { setModalMode("add"); setSelectedResource(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400 text-white text-sm font-medium hover:bg-green-500 transition-colors shadow">
                  + Add Resource
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-gray-100 bg-gray-50/90 backdrop-blur">
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Resursă</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Departament</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Condiție Deblocare</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length === 0 && !loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      {!sessionId ? "⏳ Waiting for login..." : "No resources found."}
                    </td></tr>
                  ) : displayItems.map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-green-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/services/${r.id}`)}>
                      <td className="px-6 py-3 font-medium text-gray-800">{r.name}</td>
                      <td className="px-4 py-3 text-gray-600">{r.department}</td>
                      <td className="px-4 py-3 text-gray-600">{r.unlockCondition}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setSelectedResource(r); setModalMode("edit"); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">✏️</button>
                          <button onClick={() => setDeleteTarget(r)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {useServer && (
                    <tr ref={sentinelRef}>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-400 text-xs">
                        {loading ? "⏳ Loading more..." : hasMore ? "" : "✅ All resources loaded"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {modalMode && <ResourceModal mode={modalMode} resource={selectedResource} onSave={handleSave} onClose={() => { setModalMode(null); setSelectedResource(null); }} />}
      {deleteTarget && <DeleteModal resource={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}