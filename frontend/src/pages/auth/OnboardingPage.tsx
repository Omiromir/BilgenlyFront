import { BilgenlyOnboarding } from "../../features/onboarding/components/BilgenlyOnboarding";
import { Navigate } from "react-router";
import { useAuth } from "../../app/providers/AuthProvider";
import { getDashboardPathByRole } from "../../lib/auth";
import { isOnboardingDone } from "../../features/auth/api";

export function OnboardingPage() {
    const { role, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (role && isOnboardingDone()) {
        return <Navigate to={getDashboardPathByRole(role)} replace />;
    }

    return <BilgenlyOnboarding />;
}