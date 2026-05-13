import type { ThemeMode } from "./userSettings";
import {
  SETTINGS_COUNTRY_OPTIONS,
  SETTINGS_DATE_FORMAT_OPTIONS,
  SETTINGS_LANGUAGE_OPTIONS,
  SETTINGS_TIME_ZONE_OPTIONS,
} from "./settingsPreferences";

export interface SettingsToggleMetadata {
  id: string;
  label: string;
  description: string;
}

export interface SettingsFieldMetadata {
  id: string;
  label: string;
  kind?: "input" | "textarea";
}

export interface SettingsSelectMetadata {
  id: string;
  label: string;
  options: readonly string[];
}

export interface SettingsThemeMetadata {
  value: ThemeMode;
  label: string;
}

export interface SettingsScreenMetadata {
  account: {
    fields: SettingsFieldMetadata[];
    location: SettingsSelectMetadata[];
  };
  security: {
    passwordFields: SettingsFieldMetadata[];
  };
  notifications: {
    email: SettingsToggleMetadata[];
    push: SettingsToggleMetadata[];
  };
  preferences: {
    themes: SettingsThemeMetadata[];
    region: SettingsSelectMetadata[];
  };
}

export const dashboardSettingsMetadata: SettingsScreenMetadata = {
  account: {
    fields: [
      { id: "fullName", label: "Full Name" },
      { id: "email", label: "Email" },
      { id: "phoneNumber", label: "Phone Number" },
      { id: "bio", label: "Bio", kind: "textarea" },
    ],
    location: [
      {
        id: "country",
        label: "Country",
        options: SETTINGS_COUNTRY_OPTIONS,
      },
      {
        id: "timeZone",
        label: "Time Zone",
        options: SETTINGS_TIME_ZONE_OPTIONS,
      },
    ],
  },
  security: {
    passwordFields: [
      { id: "currentPassword", label: "Current Password" },
      { id: "newPassword", label: "New Password" },
      { id: "confirmPassword", label: "Confirm New Password" },
    ],
  },
  notifications: {
    email: [
      {
        id: "quizAssignments",
        label: "Class invites and assigned quizzes",
        description: "Receive class invitation updates and follow-up quiz assignment notifications.",
      },
      {
        id: "gradingUpdates",
        label: "Review requests",
        description: "Receive follow-up notifications when a teacher asks you to review quiz work.",
      },
      {
        id: "achievementAlerts",
        label: "Achievement alerts",
        description: "Saved preference for future badge and achievement notifications.",
      },
      {
        id: "deadlineReminders",
        label: "Deadline reminders",
        description: "Saved preference for future assignment and deadline reminder notifications.",
      },
    ],
    push: [
      {
        id: "realTimeUpdates",
        label: "In-app notification delivery",
        description: "Controls whether supported notification events appear in the dashboard inbox and header.",
      },
      {
        id: "weeklySummaries",
        label: "Weekly summaries",
        description: "Saved preference for future weekly digest notifications.",
      },
    ],
  },
  preferences: {
    themes: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System" },
    ],
    region: [
      {
        id: "language",
        label: "Language",
        options: SETTINGS_LANGUAGE_OPTIONS,
      },
      {
        id: "dateFormat",
        label: "Date Format",
        options: SETTINGS_DATE_FORMAT_OPTIONS,
      },
    ],
  },
};
