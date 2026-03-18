import { Route, Routes } from "react-router";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ModeratorDashboardPage } from "../../pages/dashboard/moderator/ModeratorDashboardPage";
import { StudentDashboardPage } from "../../pages/dashboard/student/StudentDashboardPage";
import { TeacherDashboardPage } from "../../pages/dashboard/teacher/TeacherDashboardPage";
import { OnboardingPage } from "../../pages/auth/OnboardingPage";
import { ResetPasswordPage } from "../../pages/auth/ResetPasswordPage";
import { SignInPage } from "../../pages/auth/SignInPage";
import { SignUpPage } from "../../pages/auth/SignUpPage";
import { LandingPage } from "../../pages/public/LandingPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            element={<RoleRoute allowedRoles={["teacher"]} />}
          >
            <Route
              path="/dashboard/teacher"
              element={<TeacherDashboardPage />}
            />
          </Route>

          <Route
            element={<RoleRoute allowedRoles={["student"]} />}
          >
            <Route
              path="/dashboard/student"
              element={<StudentDashboardPage />}
            />
          </Route>

          <Route
            element={<RoleRoute allowedRoles={["moderator"]} />}
          >
            <Route
              path="/dashboard/moderator"
              element={<ModeratorDashboardPage />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}