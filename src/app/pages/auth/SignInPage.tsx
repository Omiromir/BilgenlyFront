import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../../features/auth/AuthLayout";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <AuthLayout
      title="Sign In To Your Account."
      subtitle="Unleash your Bilgenly study flow right now."
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

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input has-trailing"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="auth-trailing-btn"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="auth-meta-row">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <Link className="auth-link" to="/reset-password">
            Forgot Password
          </Link>
        </div>

        <button
          className="auth-primary"
          type="button"
          disabled={!email || !password}
          onClick={() => navigate("/onboarding")}
        >
          Sign In
        </button>

        <div className="auth-center-row">
          Don&apos;t have an account?{" "}
          <Link className="auth-link" to="/signup">
            Sign Up
          </Link>
        </div>

        <div className="auth-divider">Or</div>

        <div className="auth-stack">
          <button
            className="auth-secondary"
            type="button"
            onClick={() => navigate("/onboarding")}
          >
            Sign In With Google
          </button>
          <button
            className="auth-secondary"
            type="button"
            onClick={() => navigate("/onboarding")}
          >
            Sign In With Apple
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
