import { BilgenlyOnboarding } from "../../features/onboarding/components/BilgenlyOnboarding";

import { Navigate } from "react-router";
import { useAuth } from "../../app/providers/AuthProvider";
import { getDashboardPathByRole } from "../../lib/auth";

export function OnboardingPage() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (role) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return <BilgenlyOnboarding />;
}
