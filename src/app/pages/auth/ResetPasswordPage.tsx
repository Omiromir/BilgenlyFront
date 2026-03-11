import { useState } from "react";
import { Link } from "react-router";
import { AuthLayout } from "../../features/auth/AuthLayout";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Forgot your password? No worries, then let's submit a password reset. It will be sent to your email."
    >
      <div className="auth-form">
        <div className="auth-field">
          <label className="auth-label">Email Address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button
          className="auth-primary"
          type="button"
          disabled={!email}
        >
          Reset Password
        </button>

        <div className="auth-back-link">
          <Link className="auth-link" to="/signin">
            Back to login screen
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
