import { BilgenlyOnboarding } from "../../features/onboarding/components/BilgenlyOnboarding";
import { Navigate } from "react-router";
import { useAuth } from "../../app/providers/AuthProvider";
import { getRegistrationDraft } from "../../features/auth/registrationDraft";

export function OnboardingPage() {
    const {
        defaultRedirectPath,
        isAuthenticated,
        isLoading,
        onboardingCompleted,
    } = useAuth();
    const hasRegistrationDraft = Boolean(getRegistrationDraft());

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated && onboardingCompleted) {
        return <Navigate to={defaultRedirectPath} replace />;
    }

    if (!hasRegistrationDraft && !isAuthenticated) {
        return (
            <Navigate
                to="/signup"
                replace
                state={{ message: "Your registration draft is missing. Please start sign up again." }}
            />
        );
    }

    return <BilgenlyOnboarding />;
}
