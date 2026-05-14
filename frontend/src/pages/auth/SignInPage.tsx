import { AuthLayout } from "../../app/layouts/AuthLayout";
import { Navigate } from "react-router";
import { useAuth } from "../../app/providers/AuthProvider";
import { SignInForm } from "../../features/auth/components/SignInForm";

export function SignInPage() {
  const { authError, defaultRedirectPath, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={defaultRedirectPath} replace />;
  }

  return (
    <AuthLayout
      title="Sign In To Your Account."
      subtitle="Unleash your Bilgenly study flow right now."
    >
      {authError ? (
        <p className="auth-error" role="alert">
          {authError}
        </p>
      ) : null}
      <SignInForm />
    </AuthLayout>
  );
}
