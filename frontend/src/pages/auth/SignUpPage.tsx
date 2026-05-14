import { AuthLayout } from "../../app/layouts/AuthLayout";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../app/providers/AuthProvider";
import { SignUpForm } from "../../features/auth/components/SignUpForm";

export function SignUpPage() {
  const { defaultRedirectPath, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const routeState = location.state as { message?: string } | null;
  const routeMessage = routeState?.message ?? null;

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={defaultRedirectPath} replace />;
  }

  return (
    <AuthLayout
      title="Sign Up For Free."
      subtitle="Unleash your Bilgenly study flow right now."
    >
      {typeof routeMessage === "string" && routeMessage ? (
        <p className="auth-error" role="alert">{routeMessage}</p>
      ) : null}
      <SignUpForm />
    </AuthLayout>
  );
}
