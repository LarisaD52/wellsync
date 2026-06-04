// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [status, setStatus]     = useState(null);
  const [resetUrl, setResetUrl] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus("sent");
      if (data.resetUrl) setResetUrl(data.resetUrl);
      if (data.token)    setResetUrl(`${window.location.origin}/reset-password?token=${data.token}`);
    } catch {
      setStatus("error");
      setError("Server unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", maxWidth: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0fdf4, #e0f2fe)", padding: 16 }}>
      <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", padding: 40, width: "100%", maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: "#1f2937" }}>Forgot Password</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#9ca3af" }}>Enter your email and we'll send you a reset link.</p>

        {status === "sent" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: 8 }}>Reset link generated!</p>
            {resetUrl && (
              <div style={{ marginTop: 16, padding: 12, background: "#fefce8", border: "1px solid #fde047", borderRadius: 12, fontSize: 12, textAlign: "left", wordBreak: "break-all" }}>
                <p style={{ fontWeight: 600, color: "#854d0e", marginBottom: 4 }}>Demo mode — click to reset:</p>
                <a href={resetUrl} style={{ color: "#2563eb" }}>{resetUrl}</a>
              </div>
            )}
            <Link to="/login" style={{ display: "inline-block", marginTop: 16, color: "#16a34a", fontSize: 14 }}>Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>}
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#16a34a", color: "white", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link to="/login" style={{ textAlign: "center", color: "#16a34a", fontSize: 13 }}>Back to login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
