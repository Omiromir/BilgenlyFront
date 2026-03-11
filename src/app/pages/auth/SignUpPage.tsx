import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../../features/auth/AuthLayout";

export function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Sign Up For Free."
      subtitle="Unleash your Bilgenly study flow right now."
    >
      <div className="auth-form">
        <div className="auth-field">
          <label className="auth-label">Full Name</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>

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
              placeholder="Create a password"
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

        <div className="auth-strength">
          <div className="auth-strength-bars">
            <span className="active" />
            <span className="active" />
            <span className="active" />
            <span />
          </div>
          <div className="auth-strength-label">Password strength: Strong</div>
        </div>

        <button
          className="auth-primary"
          type="button"
          disabled={!fullName || !email || !password}
          onClick={() => navigate("/onboarding")}
        >
          Sign Up
        </button>

        <div className="auth-center-row">
          Already have an account?{" "}
          <Link className="auth-link" to="/signin">
            Sign In.
          </Link>
        </div>

        <div className="auth-divider">Or</div>

        <div className="auth-stack">
          <button
            className="auth-secondary"
            type="button"
            onClick={() => navigate("/onboarding")}
          >
            Sign Up With Google
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
