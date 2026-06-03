import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OTPLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_BASE;

  async function handleGenerateOTP(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("sessionId", data.sessionId);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      const role = data.user.role;
      if (role === "ADMIN") navigate("/admin");
      else if (role === "MANAGER") navigate("/manager");
      else navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(135deg, #e0f7fa, #e8f5e9)"
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: 40,
        width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 8 }}>🔐 OTP Login</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>
          {step === "email"
            ? "Enter your email to receive an OTP code"
            : "Check the server terminal for your 6-digit code"}
        </p>

        {error && (
          <div style={{
            background: "#ffebee", color: "#c62828", padding: "10px 16px",
            borderRadius: 8, marginBottom: 16, fontSize: 14
          }}>
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleGenerateOTP}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 8,
                border: "1px solid #ddd", marginBottom: 16,
                fontSize: 15, boxSizing: "border-box"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: "#2e7d32", color: "white", border: "none",
                fontSize: 16, cursor: "pointer", fontWeight: 600
              }}
            >
              {loading ? "Sending..." : "Generate OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              placeholder="6-digit OTP Code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              required
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 8,
                border: "1px solid #ddd", marginBottom: 16,
                fontSize: 24, textAlign: "center", letterSpacing: 8,
                boxSizing: "border-box"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: "#1565c0", color: "white", border: "none",
                fontSize: 16, cursor: "pointer", fontWeight: 600
              }}
            >
              {loading ? "Verifying..." : "Log In"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              style={{
                width: "100%", padding: "10px", marginTop: 8, borderRadius: 8,
                background: "transparent", color: "#666", border: "1px solid #ddd",
                fontSize: 14, cursor: "pointer"
              }}
            >
              ← Back
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#666" }}>
          <a href="/login" style={{ color: "#2e7d32" }}>Back to regular login</a>
        </p>
      </div>
    </div>
  );
}