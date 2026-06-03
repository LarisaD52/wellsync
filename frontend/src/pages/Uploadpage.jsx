import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BG = {
  backgroundImage: "url('/assets/bg-leaves.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const ACCEPTED_TYPES = {
  video: { ext: ["mp4", "mov", "avi", "webm"], icon: "🎬", color: "#7c3aed", bg: "#f5f3ff", label: "Video" },
  audio: { ext: ["mp3", "wav", "ogg", "m4a"],  icon: "🎵", color: "#2563eb", bg: "#eff6ff", label: "Audio" },
  pdf:   { ext: ["pdf"],                        icon: "📄", color: "#dc2626", bg: "#fef2f2", label: "PDF"   },
  doc:   { ext: ["doc", "docx", "ppt", "pptx", "xls", "xlsx"], icon: "📝", color: "#d97706", bg: "#fffbeb", label: "Document" },
  image: { ext: ["jpg", "jpeg", "png", "gif", "webp"],          icon: "🖼️", color: "#059669", bg: "#ecfdf5", label: "Imagine"  },
};

function getFileCategory(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return Object.entries(ACCEPTED_TYPES).find(([, v]) => v.ext.includes(ext))?.[0] || "doc";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileRow({ file, onRemove }) {
  const cat = getFileCategory(file.name);
  const meta = ACCEPTED_TYPES[cat];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: meta.bg, borderRadius: 12, border: `1px solid ${meta.color}22` }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{meta.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>{meta.label} · {formatSize(file.size)}</p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: meta.color, color: "#fff" }}>{meta.label}</span>
      <button onClick={() => onRemove(file.name)}
        style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        ×
      </button>
    </div>
  );
}

function UploadedEntry({ entry, onDelete }) {
  const meta = ACCEPTED_TYPES[entry.category];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {meta.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</p>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>
          {meta.label} · {formatSize(entry.size)} · {entry.resourceName} · {new Date(entry.uploadedAt).toLocaleString("ro-RO")}
        </p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#ecfdf5", color: "#059669", flexShrink: 0 }}>✓ Încărcat</span>
      <button onClick={() => onDelete(entry.id)}
        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
        Șterge
      </button>
    </div>
  );
}

export default function UploadPage({ resources, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [stagedFiles, setStagedFiles] = useState([]);   
  const [uploaded, setUploaded] = useState([]);          
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  function addFiles(fileList) {
    const newFiles = Array.from(fileList).filter(
      f => !stagedFiles.find(s => s.name === f.name)
    );
    setStagedFiles(prev => [...prev, ...newFiles]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleFileInput(e) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function removeStaged(name) {
    setStagedFiles(prev => prev.filter(f => f.name !== name));
  }

  async function handleUpload() {
    if (!selectedResourceId || stagedFiles.length === 0) return;
    setUploading(true);
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 900));
    const resource = resources.find(r => r.id === parseInt(selectedResourceId));
    const newEntries = stagedFiles.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size,
      category: getFileCategory(f.name),
      resourceId: resource.id,
      resourceName: resource.name,
      uploadedAt: Date.now(),
      // Create object URL for preview (RAM only)
      previewUrl: URL.createObjectURL(f),
    }));
    setUploaded(prev => [...newEntries, ...prev]);
    setStagedFiles([]);
    setSelectedResourceId("");
    setUploading(false);
  }

  function deleteUploaded(id) {
    setUploaded(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter(e => e.id !== id);
    });
  }

  const filteredUploaded = uploaded
    .filter(e => filterCat === "all" || e.category === filterCat)
    .filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.resourceName.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedResource = resources.find(r => r.id === parseInt(selectedResourceId));

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
        <button onClick={() => navigate("/admin-home")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">🏠 Home</button>
        <button onClick={() => navigate("/dashboard")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">📊 Dashboard</button>
        <button onClick={() => navigate("/services")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">🗂️ Services</button>
        <button onClick={() => navigate("/parallel")} className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">⚡ Parallel View</button>
        <button className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-purple-500 text-white">📁 Upload</button>
        <div className="flex-1" />
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onLogout} className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors">🚪 Log Out</button>
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
            <h1 className="text-xl font-bold text-gray-800">Upload Materiale</h1>
            <p className="text-xs text-gray-400">Încarcă fișiere video, audio, PDF sau documente</p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-4 py-2">
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium text-gray-700">ADMIN</span>
          </div>
        </header>

        <div className="flex-1 px-8 py-6 flex flex-col gap-6">

          {/* Upload form card */}
          <div className="bg-white/70 backdrop-blur border border-green-100 rounded-2xl shadow p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span>📤</span> Încarcă fișiere noi
            </h2>

            {/* Step 1 — select resource */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                1. Selectează resursa asociată
              </label>
              <select
                value={selectedResourceId}
                onChange={e => setSelectedResourceId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm outline-none focus:ring-2 focus:ring-purple-300 transition"
                style={{ maxWidth: 480 }}>
                <option value="">— Alege o resursă —</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.department} · {r.type})</option>
                ))}
              </select>
              {selectedResource && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">{selectedResource.department}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-600">{selectedResource.type}</span>
                  <span className="text-xs text-gray-400">⭐ {selectedResource.rating}</span>
                </div>
              )}
            </div>

            {/* Step 2 — drop zone */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                2. Adaugă fișierele
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-10 px-6"
                style={{
                  borderColor: isDragging ? "#8b5cf6" : "#d1d5db",
                  background: isDragging ? "#f5f3ff" : "#fafafa",
                }}>
                <span className="text-4xl mb-3">{isDragging ? "⬇️" : "📂"}</span>
                <p className="font-bold text-gray-700 text-sm mb-1">
                  {isDragging ? "Dă drumul fișierelor!" : "Trage fișierele aici sau click pentru a selecta"}
                </p>
                <p className="text-xs text-gray-400">Video, Audio, PDF, Document, Imagine</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                  onChange={handleFileInput}
                  style={{ display: "none" }} />
              </div>
            </div>

            {/* Staged files list */}
            {stagedFiles.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Fișiere selectate ({stagedFiles.length})
                </p>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                  {stagedFiles.map(f => (
                    <FileRow key={f.name} file={f} onRemove={removeStaged} />
                  ))}
                </div>
              </div>
            )}

            {/* Upload button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedResourceId || stagedFiles.length === 0 || uploading}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: uploading ? "#9ca3af" : "linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow: uploading ? "none" : "0 4px 14px rgba(139,92,246,0.4)" }}>
                {uploading ? "⏳ Se încarcă..." : `📤 Încarcă ${stagedFiles.length > 0 ? `(${stagedFiles.length})` : ""}`}
              </button>
              {stagedFiles.length > 0 && (
                <button onClick={() => setStagedFiles([])}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                  Anulează
                </button>
              )}
              {uploading && (
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full animate-pulse" style={{ width: "60%" }} />
                </div>
              )}
            </div>
          </div>

          {/* Uploaded files library */}
          <div className="bg-white/70 backdrop-blur border border-green-100 rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span>📚</span> Fișiere încărcate
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 font-semibold">{uploaded.length}</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                  <span className="text-gray-400 text-xs">🔍</span>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Caută..."
                    className="bg-transparent text-xs outline-none text-gray-700 w-28" />
                </div>
                {/* Category filter */}
                <select
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none text-gray-600">
                  <option value="all">Toate tipurile</option>
                  {Object.entries(ACCEPTED_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredUploaded.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm font-medium">{uploaded.length === 0 ? "Niciun fișier încărcat încă" : "Niciun rezultat găsit"}</p>
              </div>
            ) : (
              <div>
                {filteredUploaded.map(entry => (
                  <UploadedEntry key={entry.id} entry={entry} onDelete={deleteUploaded} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}