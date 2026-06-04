// src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get("token") || "";
  const navigate        = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!form.newPassword || form.newPassword.length < 4) e.newPassword = "Password must be at least 4 characters.";
    if (form.newPassword !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || "Reset failed."); return; }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setServerError("Server unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", maxWidth: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0fdf4, #e0f2fe)" }}>
      <div style={{ background: "white", borderRadius: 20, padding: 32, textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontWeight: 600 }}>Invalid reset link.</p>
        <Link to="/forgot-password" style={{ color: "#16a34a", fontSize: 14 }}>Request a new one</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", maxWidth: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0fdf4, #e0f2fe)", padding: 16 }}>
      <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", padding: 40, width: "100%", maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: "#1f2937" }}>Reset Password</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#9ca3af" }}>Enter your new password below.</p>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#16a34a", fontWeight: 600 }}>Password reset successfully!</p>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {serverError && <p style={{ color: "#ef4444", fontSize: 13, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, margin: 0 }}>{serverError}</p>}
            <div>
              <input type="password" placeholder="New Password" value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${errors.newPassword ? "#ef4444" : "#d1d5db"}`, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {errors.newPassword && <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors.newPassword}</p>}
            </div>
            <div>
              <input type="password" placeholder="Confirm New Password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${errors.confirm ? "#ef4444" : "#d1d5db"}`, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {errors.confirm && <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors.confirm}</p>}
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#16a34a", color: "white", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
