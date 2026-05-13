import {
  getScopedStorageValue,
  getUserScopedStorageKey,
  getUserStorageScope,
} from "../../../app/providers/userScopedStorage";
import type {
  StoredSettingsSession,
  ThemeMode,
  UserSettings,
  UserSettingsScopeInput,
} from "./settingsTypes";
import { getThemeMode } from "./settingsDefaults";
import {
  normalizeCountry,
  normalizeDateFormat,
  normalizeLanguage,
  normalizeTimeZone,
} from "./settingsPreferences";

const USER_SETTINGS_STORAGE_KEY = "bilgenly_user_settings_v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function getNullableStringValue(value: unknown, fallback: string | null) {
  return typeof value === "string" ? value : fallback;
}

function getBooleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function getSettingsStorageScope({
  userId,
  email,
  role,
  token,
}: UserSettingsScopeInput) {
  return getUserStorageScope({
    userId,
    email,
    role: role ?? null,
    token,
  });
}

function sanitizeSessions(
  value: unknown,
  fallback: StoredSettingsSession[],
): StoredSettingsSession[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const sessions = value
    .filter(isRecord)
    .map((session) => ({
      id: getStringValue(session.id, ""),
      device: getStringValue(session.device, ""),
      description: getStringValue(session.description, ""),
      actionLabel:
        typeof session.actionLabel === "string" ? session.actionLabel : undefined,
      destructive:
        typeof session.destructive === "boolean" ? session.destructive : undefined,
      isCurrent:
        typeof session.isCurrent === "boolean" ? session.isCurrent : undefined,
    }))
    .filter(
      (session) =>
        session.id.trim() !== "" &&
        session.device.trim() !== "" &&
        session.description.trim() !== "",
    );

  return sessions.length ? sessions : fallback;
}

export function mergeUserSettings(
  defaults: UserSettings,
  value: unknown,
): UserSettings {
  if (!isRecord(value)) {
    return defaults;
  }

  const profile = isRecord(value.profile) ? value.profile : {};
  const appearance = isRecord(value.appearance) ? value.appearance : {};
  const notifications = isRecord(value.notifications) ? value.notifications : {};
  const emailNotifications = isRecord(notifications.email)
    ? notifications.email
    : {};
  const pushNotifications = isRecord(notifications.push)
    ? notifications.push
    : {};
  const security = isRecord(value.security) ? value.security : {};
  const rolePreferences = isRecord(value.rolePreferences)
    ? value.rolePreferences
    : {};
  const teacherRolePreferences = isRecord(rolePreferences.teacher)
    ? rolePreferences.teacher
    : {};
  const studentRolePreferences = isRecord(rolePreferences.student)
    ? rolePreferences.student
    : {};
  const moderatorRolePreferences = isRecord(rolePreferences.moderator)
    ? rolePreferences.moderator
    : {};

  return {
    profile: {
      fullName: getStringValue(profile.fullName, defaults.profile.fullName),
      email: getStringValue(profile.email, defaults.profile.email),
      phoneNumber: getStringValue(
        profile.phoneNumber,
        defaults.profile.phoneNumber,
      ),
      bio: getStringValue(profile.bio, defaults.profile.bio),
      country: normalizeCountry(profile.country, defaults.profile.country),
      timeZone: normalizeTimeZone(profile.timeZone, defaults.profile.timeZone),
      language: normalizeLanguage(profile.language, defaults.profile.language),
      dateFormat: normalizeDateFormat(
        profile.dateFormat,
        defaults.profile.dateFormat,
      ),
      avatarUrl: getNullableStringValue(
        profile.avatarUrl,
        defaults.profile.avatarUrl,
      ),
    },
    appearance: {
      themeMode: getThemeMode(
        appearance.themeMode,
        defaults.appearance.themeMode,
      ),
    },
    notifications: {
      email: {
        quizAssignments: getBooleanValue(
          emailNotifications.quizAssignments,
          defaults.notifications.email.quizAssignments,
        ),
        gradingUpdates: getBooleanValue(
          emailNotifications.gradingUpdates,
          defaults.notifications.email.gradingUpdates,
        ),
        achievementAlerts: getBooleanValue(
          emailNotifications.achievementAlerts,
          defaults.notifications.email.achievementAlerts,
        ),
        deadlineReminders: getBooleanValue(
          emailNotifications.deadlineReminders,
          defaults.notifications.email.deadlineReminders,
        ),
      },
      push: {
        realTimeUpdates: getBooleanValue(
          pushNotifications.realTimeUpdates,
          defaults.notifications.push.realTimeUpdates,
        ),
        weeklySummaries: getBooleanValue(
          pushNotifications.weeklySummaries,
          defaults.notifications.push.weeklySummaries,
        ),
      },
    },
    security: {
      sessions: sanitizeSessions(security.sessions, defaults.security.sessions),
      passwordUpdatedAt: getNullableStringValue(
        security.passwordUpdatedAt,
        defaults.security.passwordUpdatedAt,
      ),
    },
    rolePreferences: {
      teacher: {
        classInvitationNotifications: getBooleanValue(
          teacherRolePreferences.classInvitationNotifications,
          defaults.rolePreferences.teacher.classInvitationNotifications,
        ),
        quizPublishingDefaults: getBooleanValue(
          teacherRolePreferences.quizPublishingDefaults,
          defaults.rolePreferences.teacher.quizPublishingDefaults,
        ),
        defaultQuizVisibility:
          teacherRolePreferences.defaultQuizVisibility === "private"
            ? "private"
            : defaults.rolePreferences.teacher.defaultQuizVisibility,
      },
      student: {
        practiceReminders: getBooleanValue(
          studentRolePreferences.practiceReminders,
          defaults.rolePreferences.student.practiceReminders,
        ),
        leaderboardVisibility: getBooleanValue(
          studentRolePreferences.leaderboardVisibility,
          defaults.rolePreferences.student.leaderboardVisibility,
        ),
        learningNotifications: getBooleanValue(
          studentRolePreferences.learningNotifications,
          defaults.rolePreferences.student.learningNotifications,
        ),
      },
      moderator: {
        moderationQueueAlerts: getBooleanValue(
          moderatorRolePreferences.moderationQueueAlerts,
          defaults.rolePreferences.moderator.moderationQueueAlerts,
        ),
        reportNotifications: getBooleanValue(
          moderatorRolePreferences.reportNotifications,
          defaults.rolePreferences.moderator.reportNotifications,
        ),
      },
    },
  };
}

export function readUserSettings(
  scope: string,
  defaults: UserSettings,
): UserSettings {
  try {
    const rawValue = getScopedStorageValue(USER_SETTINGS_STORAGE_KEY, scope);

    if (!rawValue) {
      return defaults;
    }

    return mergeUserSettings(defaults, JSON.parse(rawValue));
  } catch {
    return defaults;
  }
}

export function writeUserSettings(scope: string, settings: UserSettings) {
  localStorage.setItem(
    getUserScopedStorageKey(USER_SETTINGS_STORAGE_KEY, scope),
    JSON.stringify(settings),
  );
}
