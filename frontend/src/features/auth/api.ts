import { apiRequest, getRequestErrorMessage } from "../../lib/apiClient";
import type {
  ResetPasswordFormValues,
  SignInFormValues,
  SignUpFormValues,
} from "./types";

const AUTH_TOKEN_KEY = "bilgenly_token";
const AUTH_ROLE_KEY = "bilgenly_role";
const ONBOARDING_KEY = "bilgenly_onboarding_done";

export type UserRole = "teacher" | "student" | "moderator";

function saveAuth(token: string, role: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_ROLE_KEY, role.toLowerCase());
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface SecurityActionResult {
  mode: "local-only" | "remote";
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(AUTH_ROLE_KEY);
}

export function isOnboardingDone() {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingDone() {
    localStorage.setItem(ONBOARDING_KEY, "true");
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
}

export async function signIn(data: SignInFormValues & { rememberMe: boolean }) {
  try {
    const result = await apiRequest<{ token: string; role: string }>("/api/auth/login", {
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
      },
      skipAuth: true,
      fallbackErrorMessage: "Login failed",
    });

    saveAuth(result.token, result.role);
    return result;
  } catch (error) {
    throw new Error(getRequestErrorMessage(error, "Login failed"));
  }
}

export async function signUp(data: SignUpFormValues) {
  try {
    const result = await apiRequest<{ token: string; role: string }>("/api/auth/register", {
      method: "POST",
      body: {
        username: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role ?? "Student",
      },
      skipAuth: true,
      fallbackErrorMessage: "Registration failed",
    });

    saveAuth(result.token, result.role);
    return result;
  } catch (error) {
    throw new Error(getRequestErrorMessage(error, "Registration failed"));
  }
}

export async function updateRole(role: string) {
  try {
    const result = await apiRequest<{
      token: string;
      role: string;
      userId: string;
      username: string;
      email: string;
    }>("/api/auth/role", {
      method: "PATCH",
      body: { role },
      fallbackErrorMessage: "Failed to update role",
    });

    saveAuth(result.token, result.role);
    markOnboardingDone();
    return result;
  } catch (error) {
    throw new Error(getRequestErrorMessage(error, "Failed to update role"));
  }
}

export async function requestPasswordReset(_: ResetPasswordFormValues) {
  return new Promise((resolve) => window.setTimeout(resolve, 400));
}


export async function getMe() {
  return apiRequest<{
    userId: string;
    username: string;
    email: string;
    role: string;
  }>("/api/auth/me", {
    fallbackErrorMessage: "Unauthorized",
  });
}

export async function changePassword(_: ChangePasswordInput): Promise<SecurityActionResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({ mode: "local-only" }), 450);
  });
}

export async function revokeSessionById(_: string): Promise<SecurityActionResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({ mode: "local-only" }), 250);
  });
}
