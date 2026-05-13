import { apiRequest } from "../../../lib/apiClient";
import type {
  AssignmentAnalyticsDto,
  MyAnalyticsDto,
  QuizAnalyticsDto,
} from "./dashboardApiTypes";

export function getAssignmentAnalytics(assignmentId: string) {
  return apiRequest<AssignmentAnalyticsDto>(`/api/analytics/assignment/${assignmentId}`, {
    fallbackErrorMessage: "Unable to load assignment analytics.",
  });
}

export function getQuizAnalytics(quizId: string) {
  return apiRequest<QuizAnalyticsDto>(`/api/analytics/quiz/${quizId}`, {
    fallbackErrorMessage: "Unable to load quiz analytics.",
  });
}

export function getMyAnalytics() {
  return apiRequest<MyAnalyticsDto>("/api/analytics/me", {
    fallbackErrorMessage: "Unable to load student analytics.",
  });
}
