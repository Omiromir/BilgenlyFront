import type { StepKey } from "../onboarding/types";
import type {
    OnboardingAnswers,
    RegistrationDraft,
    SignUpFormValues,
} from "./types";
import { normalizeEmail } from "./validation";

const REGISTRATION_DRAFT_KEY = "bilgenly_registration_draft";
const ONBOARDING_DRAFT_KEY = "bilgenly_onboarding_draft";

export interface PersistedOnboardingDraft {
    answers: OnboardingAnswers;
    ownerKey?: string;
    reminderTime: string;
    step: StepKey;
    updatedAt: string;
}

function normalizeIdentitySegment(value: string) {
    return value.trim().toLowerCase();
}

export function buildOnboardingDraftOwnerKey(identity: {
    registrationEmail?: string | null;
    userEmail?: string | null;
    userId?: string | null;
}) {
    if (identity.registrationEmail?.trim()) {
        return `registration:${normalizeIdentitySegment(identity.registrationEmail)}`;
    }

    if (identity.userId?.trim()) {
        return `user:${normalizeIdentitySegment(identity.userId)}`;
    }

    if (identity.userEmail?.trim()) {
        return `user-email:${normalizeIdentitySegment(identity.userEmail)}`;
    }

    return null;
}

function readSessionValue<T>(key: string): T | null {
    const storedValue = sessionStorage.getItem(key);

    if (!storedValue) {
        return null;
    }

    try {
        return JSON.parse(storedValue) as T;
    } catch {
        sessionStorage.removeItem(key);
        return null;
    }
}

function writeSessionValue(key: string, value: unknown) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function buildRegistrationDraft(values: SignUpFormValues): RegistrationDraft {
    return {
        email: normalizeEmail(values.email),
        fullName: values.fullName.trim(),
        password: values.password,
        createdAt: new Date().toISOString(),
        source: "signup",
    };
}

export function getRegistrationDraft() {
    return readSessionValue<RegistrationDraft>(REGISTRATION_DRAFT_KEY);
}

export function saveRegistrationDraft(draft: RegistrationDraft) {
    writeSessionValue(REGISTRATION_DRAFT_KEY, draft);
}

export function clearRegistrationDraft() {
    sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
}

export function getOnboardingDraft() {
    return readSessionValue<PersistedOnboardingDraft>(ONBOARDING_DRAFT_KEY);
}

export function saveOnboardingDraft(draft: PersistedOnboardingDraft) {
    writeSessionValue(ONBOARDING_DRAFT_KEY, draft);
}

export function clearOnboardingDraft() {
    sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
}
