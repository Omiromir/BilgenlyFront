export const SETTINGS_COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Kazakhstan",
] as const;

export const SETTINGS_TIME_ZONE_OPTIONS = [
  "Pacific Time (PT)",
  "Mountain Time (MT)",
  "Central Time (CT)",
  "Eastern Time (ET)",
  "Almaty Time (ALMT)",
  "Qyzylorda Time (QYZT)",
] as const;

export const SETTINGS_LANGUAGE_OPTIONS = [
  "English",
  "Kazakh",
  "Russian",
] as const;

export const SETTINGS_DATE_FORMAT_OPTIONS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
] as const;

export type SettingsCountry = (typeof SETTINGS_COUNTRY_OPTIONS)[number];
export type SettingsTimeZone = (typeof SETTINGS_TIME_ZONE_OPTIONS)[number];
export type SettingsLanguage = (typeof SETTINGS_LANGUAGE_OPTIONS)[number];
export type SettingsDateFormat = (typeof SETTINGS_DATE_FORMAT_OPTIONS)[number];

interface FormattingPreferences {
  language: SettingsLanguage;
  dateFormat: SettingsDateFormat;
  timeZone: SettingsTimeZone;
}

const DEFAULT_FORMATTING_PREFERENCES: FormattingPreferences = {
  language: "English",
  dateFormat: "MM/DD/YYYY",
  timeZone: "Pacific Time (PT)",
};

const LANGUAGE_TO_LOCALE: Record<SettingsLanguage, string> = {
  English: "en-US",
  Kazakh: "kk-KZ",
  Russian: "ru-RU",
};

const LANGUAGE_TO_DOCUMENT_LANG: Record<SettingsLanguage, string> = {
  English: "en",
  Kazakh: "kk",
  Russian: "ru",
};

const TIME_ZONE_TO_IANA: Record<SettingsTimeZone, string> = {
  "Pacific Time (PT)": "America/Los_Angeles",
  "Mountain Time (MT)": "America/Denver",
  "Central Time (CT)": "America/Chicago",
  "Eastern Time (ET)": "America/New_York",
  "Almaty Time (ALMT)": "Asia/Almaty",
  "Qyzylorda Time (QYZT)": "Asia/Qyzylorda",
};

let currentFormattingPreferences = DEFAULT_FORMATTING_PREFERENCES;

function isSupportedStringValue<T extends readonly string[]>(
  value: unknown,
  options: T,
): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

function padDatePart(value: string) {
  return value.padStart(2, "0");
}

function resolveDate(value: string | Date) {
  const resolvedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(resolvedDate.getTime()) ? null : resolvedDate;
}

function getDateParts(date: Date, timeZone: SettingsTimeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE_TO_IANA[timeZone],
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return {
    year: padDatePart(year),
    month: padDatePart(month),
    day: padDatePart(day),
  };
}

function formatNumericDate(
  date: Date,
  preferences: FormattingPreferences,
  includeYear: boolean,
) {
  const parts = getDateParts(date, preferences.timeZone);

  if (preferences.dateFormat === "DD/MM/YYYY") {
    return includeYear
      ? `${parts.day}/${parts.month}/${parts.year}`
      : `${parts.day}/${parts.month}`;
  }

  if (preferences.dateFormat === "YYYY-MM-DD") {
    return includeYear
      ? `${parts.year}-${parts.month}-${parts.day}`
      : `${parts.month}-${parts.day}`;
  }

  return includeYear
    ? `${parts.month}/${parts.day}/${parts.year}`
    : `${parts.month}/${parts.day}`;
}

function formatLocalizedTime(date: Date, preferences: FormattingPreferences) {
  return new Intl.DateTimeFormat(resolveLocale(preferences.language), {
    timeZone: TIME_ZONE_TO_IANA[preferences.timeZone],
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function isSupportedCountry(value: unknown): value is SettingsCountry {
  return isSupportedStringValue(value, SETTINGS_COUNTRY_OPTIONS);
}

export function isSupportedTimeZone(value: unknown): value is SettingsTimeZone {
  return isSupportedStringValue(value, SETTINGS_TIME_ZONE_OPTIONS);
}

export function isSupportedLanguage(value: unknown): value is SettingsLanguage {
  return isSupportedStringValue(value, SETTINGS_LANGUAGE_OPTIONS);
}

export function isSupportedDateFormat(value: unknown): value is SettingsDateFormat {
  return isSupportedStringValue(value, SETTINGS_DATE_FORMAT_OPTIONS);
}

export function getDefaultCountry(): SettingsCountry {
  return SETTINGS_COUNTRY_OPTIONS[0];
}

export function getDefaultTimeZone(): SettingsTimeZone {
  return DEFAULT_FORMATTING_PREFERENCES.timeZone;
}

export function getDefaultLanguage(): SettingsLanguage {
  return DEFAULT_FORMATTING_PREFERENCES.language;
}

export function getDefaultDateFormat(): SettingsDateFormat {
  return DEFAULT_FORMATTING_PREFERENCES.dateFormat;
}

export function normalizeCountry(
  value: unknown,
  fallback: SettingsCountry,
): SettingsCountry {
  return isSupportedCountry(value) ? value : fallback;
}

export function normalizeTimeZone(
  value: unknown,
  fallback: SettingsTimeZone,
): SettingsTimeZone {
  return isSupportedTimeZone(value) ? value : fallback;
}

export function normalizeLanguage(
  value: unknown,
  fallback: SettingsLanguage,
): SettingsLanguage {
  if (value === "en") {
    return "English";
  }

  if (value === "kk") {
    return "Kazakh";
  }

  if (value === "ru") {
    return "Russian";
  }

  return isSupportedLanguage(value) ? value : fallback;
}

export function normalizeDateFormat(
  value: unknown,
  fallback: SettingsDateFormat,
): SettingsDateFormat {
  return isSupportedDateFormat(value) ? value : fallback;
}

export function resolveLocale(language: SettingsLanguage) {
  return LANGUAGE_TO_LOCALE[language];
}

export function resolveDocumentLanguage(language: SettingsLanguage) {
  return LANGUAGE_TO_DOCUMENT_LANG[language];
}

export function syncFormattingPreferences(next: FormattingPreferences) {
  currentFormattingPreferences = next;
}

export function formatCurrentDate(
  value: string | Date,
  options?: {
    includeYear?: boolean;
  },
) {
  const resolvedDate = resolveDate(value);

  if (!resolvedDate) {
    return "Invalid date";
  }

  return formatNumericDate(
    resolvedDate,
    currentFormattingPreferences,
    options?.includeYear ?? true,
  );
}

export function formatCurrentDateTime(value: string | Date) {
  const resolvedDate = resolveDate(value);

  if (!resolvedDate) {
    return "Invalid date";
  }

  return `${formatNumericDate(
    resolvedDate,
    currentFormattingPreferences,
    true,
  )} · ${formatLocalizedTime(resolvedDate, currentFormattingPreferences)}`;
}

export function formatCurrentShortDate(value: string | Date) {
  const resolvedDate = resolveDate(value);

  if (!resolvedDate) {
    return "Invalid date";
  }

  return formatNumericDate(
    resolvedDate,
    currentFormattingPreferences,
    false,
  );
}
