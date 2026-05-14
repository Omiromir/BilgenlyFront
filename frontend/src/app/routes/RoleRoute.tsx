import { Navigate, Outlet } from "react-router";
import { UserRole } from "../../lib/auth";
import {useAuth } from "../providers/AuthProvider";
import { getDashboardPathByRole } from "../../lib/auth";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { role, isLoading, isAuthenticated, onboardingCompleted } = useAuth();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/signin" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return <Outlet />;
}

