import type { UserRole } from "../../../lib/auth";
import type {
  SettingsCountry,
  SettingsDateFormat,
  SettingsLanguage,
  SettingsTimeZone,
} from "./settingsPreferences";

export type ThemeMode = "light" | "dark" | "system";

export type EmailNotificationPreferenceKey =
  | "quizAssignments"
  | "gradingUpdates"
  | "achievementAlerts"
  | "deadlineReminders";

export type PushNotificationPreferenceKey =
  | "realTimeUpdates"
  | "weeklySummaries";

export interface StoredSettingsSession {
  id: string;
  device: string;
  description: string;
  actionLabel?: string;
  destructive?: boolean;
  isCurrent?: boolean;
}

export interface UserSettingsProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  country: SettingsCountry;
  timeZone: SettingsTimeZone;
  language: SettingsLanguage;
  dateFormat: SettingsDateFormat;
  avatarUrl: string | null;
}

export interface UserSettings {
  profile: UserSettingsProfile;
  appearance: {
    themeMode: ThemeMode;
  };
  notifications: {
    email: Record<EmailNotificationPreferenceKey, boolean>;
    push: Record<PushNotificationPreferenceKey, boolean>;
  };
  security: {
    sessions: StoredSettingsSession[];
    passwordUpdatedAt: string | null;
  };
  rolePreferences: {
    teacher: {
      classInvitationNotifications: boolean;
      quizPublishingDefaults: boolean;
      defaultQuizVisibility: "class" | "private";
    };
    student: {
      practiceReminders: boolean;
      leaderboardVisibility: boolean;
      learningNotifications: boolean;
    };
    moderator: {
      moderationQueueAlerts: boolean;
      reportNotifications: boolean;
    };
  };
}

export interface UserSettingsScopeInput {
  userId?: string | null;
  email?: string | null;
  role?: UserRole | null;
  token?: string | null;
}
