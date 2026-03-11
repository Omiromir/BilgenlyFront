import { Route, Routes } from "react-router";
import BilgenlyOnboarding from "../components/auth/bilgenly-onboarding";
import { LandingPage } from "../pages/LandingPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { SignInPage } from "../pages/auth/SignInPage";
import { SignUpPage } from "../pages/auth/SignUpPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<BilgenlyOnboarding />} />
    </Routes>
  );
}
