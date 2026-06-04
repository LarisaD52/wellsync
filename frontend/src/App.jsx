import { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initialResources } from "./data/store";
import { saveUsername, loadUsername, deleteCookie, COOKIE_KEYS, setCookie, getCookie } from "./hooks/Cookies";
import { useApi } from "./hooks/useApi";
import { useWebSocket } from "./hooks/useWebSocket";
import StatusBar from "../StatusBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ClarityPage from "./pages/ClarityPage";
import AdminHomePage from "./pages/AdminHomePage";
import DashboardPage from "./pages/DashboardPage";
import ServicesPage from "./pages/ServicesPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import UserMaterialsPage from "./pages/UserMaterialsPage";
import ParallelViewPage from "./pages/Parallelviewpage";
import UploadPage from "./pages/Uploadpage";
import ChatPage from "./pages/ChatPage";
import SuspiciousPage from "./pages/SuspiciousPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import ManagerHomePage from "./pages/ManagerHomePage";
import "../styles/animations.css";
import OTPLoginPage from "./pages/OTPLoginPage";

const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:3001/api";

function isAdminCredentials(email) {
  return email.toLowerCase().includes("admin");
}
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}
function AdminRoute({ isLoggedIn, isAdmin, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/materials" replace />;
  return children;
}
function ManagerRoute({ isLoggedIn, isManager, isAdmin, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isManager && !isAdmin) return <Navigate to="/welcome" replace />;
  return children;
}
function PublicRoute({ isLoggedIn, children }) {
  if (isLoggedIn) { const role = getCookie("ws_role"); return <Navigate to={role === "ADMIN" ? "/admin-home" : role === "MANAGER" ? "/manager-home" : "/welcome"} replace />; }
  return children;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getCookie("ws_logged_in") === true);
  const [isAdmin, setIsAdmin]       = useState(() => getCookie("ws_is_admin") === true);
  const [username, setUsername]     = useState(() => loadUsername() || "");
  const [department, setDepartment] = useState(() => getCookie("ws_department") || "IT");
  const [sessionId, setSessionId]   = useState(() => getCookie("ws_session_id") || null);
  const [token, setToken]           = useState(() => getCookie("ws_token") || null);
  const [isManager, setIsManager]   = useState(() => getCookie("ws_role") === "MANAGER");

  const { resources, isOnline, isSyncing, pendingCount, handleAdd, handleUpdate, handleDelete } =
    useApi(initialResources, sessionId, token, handleLogout);

  

  const logoutRef = useRef(null);
  useEffect(() => {
    logoutRef.current = handleLogout;
  });

  useEffect(() => {
    if (!sessionId || !token) return;
    let timer = setTimeout(() => logoutRef.current(), 15 * 1000);
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => logoutRef.current(), 15 * 1000); };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("click", reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("click", reset);
    };
  }, [sessionId, token]);
    batch.forEach(r => handleAdd(r));
  });

  // password param now passed from LoginPage
  async function handleLogin(nameOrEmail = "", dept = "", password = null) {
    const admin = isAdminCredentials(nameOrEmail);
    const displayName = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
    const finalName = displayName || "User";
    const finalDept = dept || department || "IT";

    try {
      const email = nameOrEmail.includes("@") ? nameOrEmail : `${nameOrEmail}@wellsync.com`;
      // Use real password if provided, fallback to default
      const pwd = password || (admin ? "admin123" : "user123");

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        setCookie("ws_session_id", data.sessionId);
        if (data.token) { setToken(data.token); setCookie("ws_token", data.token); }
        // Use real name from backend if available
        const realName = data.user?.fullName?.split(" ")[0] || finalName;
        const realDept = data.user?.department || finalDept;
        setUsername(realName);
        setDepartment(realDept);
        saveUsername(realName);
        setCookie("ws_department", realDept);
        setCookie("ws_logged_in", true);
        setCookie("ws_is_admin", data.user?.role === "ADMIN");
        setIsAdmin(data.user?.role === "ADMIN");
        setIsManager(data.user?.role === "MANAGER");
        setCookie("ws_role", data.user?.role);
        setIsLoggedIn(true);
        return;
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      console.warn("[App] Backend login failed:", err.message);
      // Offline fallback
      setIsAdmin(admin);
      setUsername(finalName);
      setDepartment(finalDept);
      setIsLoggedIn(true);
      saveUsername(finalName);
      setCookie("ws_department", finalDept);
      setCookie("ws_logged_in", true);
      setCookie("ws_is_admin", admin);
      throw err; // re-throw so LoginPage can show error
    }
  }

  function handleLogout() {
    if (sessionId) {
      fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: { "x-session-id": sessionId } }).catch(() => {});
    }
    setIsLoggedIn(false); setIsAdmin(false); setSessionId(null);
    deleteCookie(COOKIE_KEYS.MOOD); deleteCookie(COOKIE_KEYS.USERNAME);
    deleteCookie("ws_department"); deleteCookie("ws_logged_in");
    deleteCookie("ws_is_admin"); deleteCookie("ws_session_id"); deleteCookie("ws_token");
    setUsername(""); setToken(null); setIsManager(false); deleteCookie("ws_role");
  }

  function handleOAuthLogin(sid, tok, role) {
    setSessionId(sid); setToken(tok);
    setIsLoggedIn(true); setIsAdmin(role === "ADMIN");
    setUsername(role === "ADMIN" ? "Admin" : "User");
  }

  return (
    <BrowserRouter>
      {isLoggedIn && isAdmin && (
        <StatusBar isOnline={isOnline} wsStatus={wsStatus} isSyncing={isSyncing} pendingCount={pendingCount} />
      )}
      <Routes>
        <Route path="/" element={
          !isLoggedIn ? <Navigate to="/landing" replace />
            : isAdmin ? <Navigate to="/admin-home" replace />
            : isManager ? <Navigate to="/manager-home" replace />
            : <Navigate to="/welcome" replace />
        } />
        <Route path="/landing" element={<PublicRoute isLoggedIn={isLoggedIn}><HomePage /></PublicRoute>} />
        <Route path="/login"   element={<PublicRoute isLoggedIn={isLoggedIn}><LoginPage onLogin={handleLogin} /></PublicRoute>} />
        <Route path="/otp-login"   element={<PublicRoute isLoggedIn={isLoggedIn}><OTPLoginPage /></PublicRoute>} />
        <Route path="/signup"  element={<PublicRoute isLoggedIn={isLoggedIn}><SignUpPage onLogin={handleLogin} /></PublicRoute>} />
        <Route path="/welcome" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ClarityPage username={username} /></ProtectedRoute>} />
        <Route path="/materials" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <UserMaterialsPage resources={resources} username={username} department={department} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin-home" element={
          <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <AdminHomePage username={username} resources={resources} onLogout={handleLogout} />
          </AdminRoute>
        } />
        <Route path="/upload" element={
          <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <UploadPage resources={resources} onLogout={handleLogout} />
          </AdminRoute>
        } />
        <Route path="/dashboard" element={
          <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <DashboardPage resources={resources} onLogout={handleLogout} />
          </AdminRoute>
        } />
        <Route path="/services" element={
          <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ServicesPage resources={resources} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} onLogout={handleLogout} sessionId={sessionId} />
          </AdminRoute>
        } />
        <Route path="/services/:id" element={
          <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ResourceDetailPage resources={resources} onUpdate={handleUpdate} onDelete={handleDelete} />
          </AdminRoute>
        } />
        <Route path="/parallel" element={
          <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
            <ParallelViewPage resources={resources} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} onLogout={handleLogout} />
          </AdminRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <ChatPage username={username} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/suspicious" element={
  <AdminRoute isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
    <SuspiciousPage onLogout={handleLogout} />
  </AdminRoute>
} />
        <Route path="/manager-home" element={
          <ManagerRoute isLoggedIn={isLoggedIn} isManager={isManager} isAdmin={isAdmin}>
            <ManagerHomePage username={username} resources={resources} onLogout={handleLogout} />
          </ManagerRoute>
        } />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />
        <Route path="/oauth-callback"   element={<OAuthCallbackPage onOAuthLogin={handleOAuthLogin} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


// auto-logout patch - added below
