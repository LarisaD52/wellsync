// src/pages/OAuthCallbackPage.jsx
// Handles redirect from backend after Google OAuth
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setCookie } from "../hooks/Cookies";

export default function OAuthCallbackPage({ onOAuthLogin }) {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    const token     = searchParams.get("token");
    const role      = searchParams.get("role");

    if (sessionId && token) {
      // Store credentials
      setCookie("ws_session_id", sessionId);
      setCookie("ws_token", token);
      setCookie("ws_logged_in", true);
      setCookie("ws_is_admin", role === "ADMIN");

      if (onOAuthLogin) onOAuthLogin(sessionId, token, role);

      navigate(role === "ADMIN" ? "/admin-home" : "/welcome", { replace: true });
    } else {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-500">Completing sign-in...</p>
      </div>
    </div>
  );
}
