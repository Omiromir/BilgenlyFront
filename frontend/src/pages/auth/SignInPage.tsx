import { AuthLayout } from "../../app/layouts/AuthLayout";
import { Navigate } from "react-router";
import { useAuth } from "../../app/providers/AuthProvider";
import { SignInForm } from "../../features/auth/components/SignInForm";
import { isOnboardingDone } from "../../features/auth/api";
import { getDashboardPathByRole } from "../../lib/auth";

export function SignInPage() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isAuthenticated && role) {
    return (
      <Navigate
        to={isOnboardingDone() ? getDashboardPathByRole(role) : "/onboarding"}
        replace
      />
    );
  }

  return (
    <AuthLayout
      title="Sign In To Your Account."
      subtitle="Unleash your Bilgenly study flow right now."
    >
      <SignInForm />
    </AuthLayout>
  );
}
