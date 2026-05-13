const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5241"
    : "https://bilgenly-1.onrender.com")
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "bilgenly_token";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? text : null;
}

function extractErrorMessage(payload: unknown, fallbackMessage: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string" &&
    (payload as { message: string }).message.trim()
  ) {
    return (payload as { message: string }).message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return fallbackMessage;
}

export function getRequestErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "Unable to reach the server. Please try again.";
    }

    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
  fallbackErrorMessage?: string;
}

export async function apiRequest<T>(
  path: string,
  {
    body,
    headers,
    skipAuth = false,
    fallbackErrorMessage = "Request failed",
    ...init
  }: ApiRequestOptions = {},
) {
  const token = skipAuth ? null : getAuthToken();
  const nextHeaders = new Headers(headers);

  if (body !== undefined && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers: nextHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, fallbackErrorMessage),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
