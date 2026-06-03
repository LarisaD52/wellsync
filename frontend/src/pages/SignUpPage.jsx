import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DEPARTMENTS } from "../data/store";

const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";

export default function SignUpPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", department: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate() {
    const e = {};
    if (!form.fullName || form.fullName.trim().length < 2) e.fullName = "Full name is required.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password || form.password.length < 4) e.password = "Password must be at least 4 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!form.department) e.department = "Please select a department.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError("");

    try {
      // Register in backend
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          password: form.password,
          department: form.department,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || "Eroare la înregistrare.");
        return;
      }

      // Auto-login after register
      if (onLogin) {
        await onLogin(form.email, form.department, form.password);
        navigate("/welcome");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setServerError("Serverul nu este disponibil. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* LEFT */}
      <div className="hidden lg:block lg:w-1/2 relative flex-shrink-0">
        <img src="/assets/community.jpg" alt="Community" className="w-full h-full object-cover" />
      </div>

      {/* RIGHT */}
      <div className="flex-1 relative flex flex-col h-screen overflow-hidden"
        style={{ backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center right" }}>
        <div className="absolute inset-0 bg-white/30" />

        <nav className="relative z-10 flex items-center justify-between px-8 py-4 flex-shrink-0">
          <Link to="/" className="w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white/70 backdrop-blur overflow-hidden hover-press">
            <img src="/assets/logo-leaf.png" className="w-7 h-7" />
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <Link to="/login" className="px-4 py-1.5 rounded-full bg-green-400/80 text-white hover:bg-green-500 hover-press">Login</Link>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 items-center justify-center px-8">
          <div className="w-full max-w-sm auth-card">
            <h2 className="text-3xl font-bold mb-5" style={{ color: "#7b5fc4" }}>Join the community!</h2>

            {serverError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              {[
                { key: "fullName", type: "text", placeholder: "Full Name" },
                { key: "email", type: "email", placeholder: "Corporate Email" },
                { key: "password", type: "password", placeholder: "Password" },
                { key: "confirm", type: "password", placeholder: "Confirm your Password" },
              ].map(({ key, type, placeholder }) => (
                <div key={key}>
                  <input type={type} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white/80 text-sm outline-none focus:ring-2 focus:ring-purple-300 ${errors[key] ? "border-red-400" : "border-gray-200"}`} />
                  {errors[key] && <p className="text-red-500 text-xs">{errors[key]}</p>}
                </div>
              ))}

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/80 ${errors.department ? "border-red-400" : "border-gray-200"}`}>
                  <option value="">Selectează departamentul...</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-green-400 text-white hover:bg-green-500 hover-press mt-2 disabled:opacity-50">
                {loading ? "Se înregistrează..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-green-500 hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}