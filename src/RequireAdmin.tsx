// Client-side replacement for app/admin/layout.tsx's server-side auth+role
// gate and middleware.ts's /admin redirect. AuthContext's user already
// carries `role` from GET /api/auth/session, so no extra request is needed.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
