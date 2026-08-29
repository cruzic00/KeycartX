// Client-side replacement for middleware.ts's PROTECTED-path redirect
// (/account, /orders, /profile) — the Next middleware ran this server-side
// before the page rendered; here it runs after AuthContext resolves.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <>{children}</>;
}
