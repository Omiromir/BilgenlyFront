import type { UserRole } from "../../../lib/auth";
import type { MockDashboardUser } from "../mock/mockUsers";
import type { ThemeMode, UserSettings } from "./settingsTypes";
import {
  getDefaultCountry as getPreferenceDefaultCountry,
  getDefaultDateFormat,
  getDefaultLanguage,
  getDefaultTimeZone,
  normalizeCountry,
} from "./settingsPreferences";

function getRoleLabel(role: UserRole | null | undefined) {
  if (!role) {
    return "Bilgenly User";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getDefaultCountry(location: string | null | undefined) {
  if (!location?.trim()) {
    return getPreferenceDefaultCountry();
  }

  return normalizeCountry(
    location.split(",")[0]?.trim(),
    getPreferenceDefaultCountry(),
  );
}

export function getProfileInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getThemeMode(value: unknown, fallback: ThemeMode): ThemeMode {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : fallback;
}

export function createDefaultUserSettings({
  role,
  user,
}: {
  role: UserRole | null;
  user: MockDashboardUser | null;
}): UserSettings {
  const fullName = user?.fullName ?? "Bilgenly User";
  const email = user?.email ?? "user@bilgenly.com";
  const country = getDefaultCountry(user?.location);

  return {
    profile: {
      fullName,
      email,
      phoneNumber: "+1 (555) 123-4567",
      bio: user?.bio ?? `${getRoleLabel(role)} profile`,
      country,
      timeZone: getDefaultTimeZone(),
      language: getDefaultLanguage(),
      dateFormat: getDefaultDateFormat(),
      avatarUrl: null,
    },
    appearance: {
      themeMode: "light",
    },
    notifications: {
      email: {
        quizAssignments: true,
        gradingUpdates: true,
        achievementAlerts: false,
        deadlineReminders: false,
      },
      push: {
        realTimeUpdates: true,
        weeklySummaries: true,
      },
    },
    security: {
      sessions: [
        {
          id: "current-session",
          device: "Chrome on MacBook Pro",
          description: `${country} - Active now`,
          isCurrent: true,
        },
        {
          id: "mobile-session",
          device: "Safari on iPhone",
          description: `${country} - 2 hours ago`,
          actionLabel: "Revoke",
          destructive: true,
        },
      ],
      passwordUpdatedAt: null,
    },
    rolePreferences: {
      teacher: {
        classInvitationNotifications: true,
        quizPublishingDefaults: true,
        defaultQuizVisibility: "class",
      },
      student: {
        practiceReminders: true,
        leaderboardVisibility: true,
        learningNotifications: true,
      },
      moderator: {
        moderationQueueAlerts: true,
        reportNotifications: true,
      },
    },
  };
}
