import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate() {
    const e = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.password || form.password.length < 4)
      e.password = "Password must be at least 4 characters.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError("");
    try {
      // Pass real password to App.jsx handleLogin
      await onLogin(form.email, "", form.password);
      const isAdmin = form.email.toLowerCase().includes("admin");
      navigate(isAdmin ? "/admin-home" : "/welcome");
    } catch (err) {
      setServerError("Email sau parolă incorectă.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col page-enter"
      style={{ backgroundImage: "url('/assets/bg-leaves.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-white/20" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 anim-fade-in">
        <Link to="/" className="w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center bg-white/70 backdrop-blur overflow-hidden hover-press">
          <img src="/assets/logo-leaf.png" alt="WellSync Logo" className="w-7 h-7 object-contain" />
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <Link to="/signup" className="px-4 py-1.5 rounded-full border border-green-300 bg-white/60 text-green-700 hover:bg-white/80 transition-colors font-medium backdrop-blur hover-press">
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="bg-white/55 backdrop-blur-md border border-green-200/60 rounded-2xl shadow-xl p-10 w-full max-w-md auth-card anim-scale-in"
          style={{ boxShadow: "0 0 30px rgba(110,210,110,0.15), 0 8px 32px rgba(0,0,0,0.08)" }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials to access WellSync Enterprise.</p>

          {serverError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="anim-fade-up delay-1">
              <input type="email" placeholder="Email Address" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-700 text-sm outline-none focus:ring-2 focus:ring-green-300 transition ${errors.email ? "border-red-400" : "border-gray-200"}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="anim-fade-up delay-2">
              <input type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-700 text-sm outline-none focus:ring-2 focus:ring-green-300 transition ${errors.password ? "border-red-400" : "border-gray-200"}`} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <Link to="/forgot-password" className="text-right text-green-500 text-xs hover:underline anim-fade-in delay-3 block">Forgot Password?</Link>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-white/80 border border-gray-200 text-gray-700 font-semibold hover:bg-white transition-colors shadow text-sm hover-press anim-fade-up delay-3 disabled:opacity-50">
              {loading ? "Se conectează..." : "Login"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className="bg-white/60 px-2">or continue with</span>
              </div>
            </div>

            <a
              href={`${import.meta.env.VITE_API_BASE?.replace('/api','') || 'https://localhost:3001'}/api/auth/google`}
              className="w-full py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white transition shadow hover-press anim-fade-up delay-4"
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Sign in with Google
            </a>

            <Link
              to="/otp-login"
              className="w-full py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white transition shadow hover-press anim-fade-up delay-4"
            >
              🔐 Login with OTP
            </Link>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6 anim-fade-in delay-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-500 hover:underline font-medium">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}