export type UserRole = "teacher" | "student" | "moderator";

export function getDashboardPathByRole(role: UserRole) {
  switch (role) {
    case "teacher":
      return "/dashboard/teacher";
    case "student":
      return "/dashboard/student";
    case "moderator":
      return "/dashboard/moderator";
    default:
      return "/signin";
  }
}