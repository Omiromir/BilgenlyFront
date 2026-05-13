import { useMemo } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useSettings } from "../../../app/providers/SettingsProvider";
import { getProfileInitials } from "../settings/userSettings";

export function useDashboardViewer() {
  const { currentUser, role } = useAuth();
  const { settings } = useSettings();

  return useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return {
      ...currentUser,
      fullName: settings.profile.fullName,
      email: settings.profile.email,
      initials: getProfileInitials(settings.profile.fullName),
      location: settings.profile.country,
      bio: settings.profile.bio,
      roleLabel: role ? role.charAt(0).toUpperCase() + role.slice(1) : "User",
      phoneNumber: settings.profile.phoneNumber,
    };
  }, [
    currentUser,
    role,
    settings.profile.bio,
    settings.profile.country,
    settings.profile.email,
    settings.profile.fullName,
    settings.profile.phoneNumber,
  ]);
}
