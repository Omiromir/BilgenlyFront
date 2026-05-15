import { apiRequest, getRequestErrorMessage } from "../../lib/apiClient";

export interface UpdateProfileInput {
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileResponse {
  userId: string;
  username: string;
  email: string;
  role: string;
  bio?: string | null;
  avatarUrl?: string | null;
  token?: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  try {
    return await apiRequest<UpdateProfileResponse>("/api/auth/profile", {
      method: "PATCH",
      body: input,
      fallbackErrorMessage: "Unable to update profile.",
    });
  } catch (error) {
    throw new Error(getRequestErrorMessage(error, "Unable to update profile."));
  }
}
