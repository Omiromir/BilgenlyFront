import { useMemo } from "react";
import { useSettings } from "../../../app/providers/SettingsProvider";
import type { ProfileSummary } from "../mock/sharedUi";
import { useDashboardViewer } from "./useDashboardViewer";

export function useProfile(fallback: ProfileSummary) {
    const dashboardViewer = useDashboardViewer();
    const { settings } = useSettings();

    return useMemo(() => {
        if (!dashboardViewer) {
            return fallback;
        }

        return {
            ...fallback,
            name: dashboardViewer.fullName,
            email: dashboardViewer.email,
            roleLabel: dashboardViewer.roleLabel,
            initials: dashboardViewer.initials,
            joinedLabel: dashboardViewer.joinedLabel,
            location: settings.profile.country,
            bio: settings.profile.bio,
            personalInfo: [
                { label: "Full Name", value: settings.profile.fullName },
                { label: "Email", value: settings.profile.email },
                { label: "Phone", value: settings.profile.phoneNumber },
                { label: "Location", value: settings.profile.country },
            ],
        };
    }, [dashboardViewer, fallback, settings.profile.bio, settings.profile.country, settings.profile.email, settings.profile.fullName, settings.profile.phoneNumber]);
}
