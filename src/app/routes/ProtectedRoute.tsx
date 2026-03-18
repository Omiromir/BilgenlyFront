import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}