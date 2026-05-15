import avatar1 from "../../assets/avatars/avatar_1.jpg";
import avatar2 from "../../assets/avatars/avatar_2.jpg";
import avatar3 from "../../assets/avatars/avatar_3.jpg";
import avatar4 from "../../assets/avatars/avatar_4.jpg";

export interface StaticAvatarOption {
  id: string;
  label: string;
  src: string;
}

export const STATIC_AVATAR_OPTIONS: StaticAvatarOption[] = [
  { id: "avatar_1", label: "Avatar 1", src: avatar1 },
  { id: "avatar_2", label: "Avatar 2", src: avatar2 },
  { id: "avatar_3", label: "Avatar 3", src: avatar3 },
  { id: "avatar_4", label: "Avatar 4", src: avatar4 },
];

export function resolveAvatarUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = STATIC_AVATAR_OPTIONS.find((option) => option.id === value);
  if (match) return match.src;
  // Backwards-compat: backend may already store a resolved URL or a data URL.
  if (/^https?:\/\//i.test(value) || value.startsWith("/") || value.startsWith("data:")) {
    return value;
  }
  return null;
}

export function isStaticAvatarId(value: string | null | undefined): boolean {
  if (!value) return false;
  return STATIC_AVATAR_OPTIONS.some((option) => option.id === value);
}
