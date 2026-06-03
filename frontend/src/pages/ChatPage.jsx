// src/pages/ChatPage.jsx
// Silver Challenge: Real-time chat with Socket.io
// Messages: own = right (green), others = left (white)
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getCookie } from "../hooks/Cookies";

const BG = {
  backgroundImage: "url('/assets/bg-leaves.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function ChatPage({ username, onLogout }) {
  const navigate    = useNavigate();
  const isAdmin     = getCookie("ws_is_admin") === true || getCookie("ws_is_admin") === "true";
  const sessionId   = getCookie("ws_session_id");
  // Use username from props (already set correctly in App.jsx)
  const myName      = username || getCookie("ws_username") || "Anonymous";

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      auth: { sessionId, userName: myName, role: isAdmin ? "ADMIN" : "USER" },
    });
    socketRef.current = socket;

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chat:history", (history) => setMessages(history));
    socket.on("chat:message", (msg)     => setMessages(prev => [...prev, msg]));

    return () => socket.disconnect();
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !connected) return;
    socketRef.current.emit("chat:send", input.trim());
    setInput("");
  }

  // Sidebar buttons
  const sidebarBtns = isAdmin
    ? [
        { label: "🏠 Home",          path: "/admin-home" },
        { label: "📊 Dashboard",     path: "/dashboard" },
        { label: "🗂️ Services",      path: "/services" },
        { label: "⚡ Parallel View", path: "/parallel" },
        { label: "📁 Upload",        path: "/upload" },
      ]
    : [
        { label: "🧭 Wellness",         path: "/welcome" },
        { label: "📚 Materialele mele", path: "/materials" },
      ];

  return (
    <div className="h-screen w-screen flex overflow-hidden relative" style={BG}>
      <div className="absolute inset-0 bg-white/30" />

      {/* Sidebar */}
      <aside className="relative z-10 w-48 bg-white/60 backdrop-blur border-r border-green-100 flex flex-col py-6 px-4 gap-2 flex-shrink-0">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white overflow-hidden">
            <img src="/assets/logo-leaf.png" alt="Logo" className="w-9 h-9 object-contain"
              onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        </div>

        {sidebarBtns.map(b => (
          <button key={b.path} onClick={() => navigate(b.path)}
            className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">
            {b.label}
          </button>
        ))}
        <button className="w-full px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-green-400 text-white">
          💬 Chat
        </button>

        <div className="flex-1" />
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-red-500 transition-colors">
            🚪 Log Out
          </button>
          <div className="flex flex-col items-center mt-3 gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
            <span className="text-xs text-gray-500 font-medium">{myName}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: isAdmin ? "#dcfce7" : "#eff6ff", color: isAdmin ? "#16a34a" : "#2563eb" }}>
              {isAdmin ? "ADMIN" : "USER"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-green-100 bg-white/40 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Real-Time Chat</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
                <span className="text-xs text-gray-400">{connected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full px-4 py-2">
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium text-gray-700">{myName}</span>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <span className="text-4xl">💬</span>
              <p className="text-sm">Niciun mesaj încă. Fii primul care scrie!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            // System messages — centered
            if (msg.type === "system") {
              return (
                <div key={i} className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-white/60 backdrop-blur px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            // Determine if message is mine
            const isMe = msg.userName === myName;

            return (
              <div key={i} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {/* Name + role + time */}
                <div className={`flex items-center gap-2 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="text-xs font-semibold text-gray-600">{msg.userName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: msg.role === "ADMIN" ? "#dcfce7" : "#eff6ff",
                      color: msg.role === "ADMIN" ? "#16a34a" : "#2563eb",
                      fontSize: 10,
                    }}>
                    {msg.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Bubble */}
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  isMe
                    ? "bg-green-400 text-white rounded-tr-sm"
                    : "bg-white/90 text-gray-800 rounded-tl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage}
          className="flex items-center gap-3 px-6 py-4 border-t border-green-100 bg-white/40 backdrop-blur flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={connected ? "Scrie un mesaj..." : "Se conectează..."}
            disabled={!connected}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-green-300 transition disabled:opacity-50"
          />
          <button type="submit" disabled={!connected || !input.trim()}
            className="px-6 py-3 rounded-xl bg-green-400 text-white font-semibold text-sm hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow">
            Trimite →
          </button>
        </form>
      </main>
    </div>
  );
}