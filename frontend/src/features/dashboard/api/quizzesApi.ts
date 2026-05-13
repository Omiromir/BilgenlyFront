import { apiRequest } from "../../../lib/apiClient";
import type { CreateQuizRequest, QuizDto } from "./dashboardApiTypes";

export function createQuiz(payload: CreateQuizRequest) {
  return apiRequest<QuizDto>("/api/Quiz", {
    method: "POST",
    body: payload,
    fallbackErrorMessage: "Unable to save quiz to backend.",
  });
}
