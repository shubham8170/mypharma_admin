import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute() {
  const { token, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="auth-loading" role="status">
        <span className="auth-loading-dot" />
        Loading…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
