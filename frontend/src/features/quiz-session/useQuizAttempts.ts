import { useEffect, useMemo, useState } from "react";
import { getAttemptsByQuiz, type QuizAttemptDto } from "./api/attemptsApi";
import { getRequestErrorMessage } from "../../lib/apiClient";

interface UseQuizAttemptsOptions {
  quizId?: string;
  assignmentId?: string | null;
  enabled?: boolean;
}

export interface QuizAttemptsState {
  quizId: string;
  assignmentId: string | undefined;
  attempts: QuizAttemptDto[];
  attemptsCompleted: number;
  hasActiveAttempt: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const attemptsCache = new Map<string, { data: QuizAttemptDto[]; timestamp: number }>();
const CACHE_DURATION_MS = 30000; // 30 seconds

function getCachedAttempts(quizId: string): QuizAttemptDto[] | null {
  const cached = attemptsCache.get(quizId);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
    attemptsCache.delete(quizId);
    return null;
  }
  return cached.data;
}

function setCachedAttempts(quizId: string, attempts: QuizAttemptDto[]) {
  attemptsCache.set(quizId, { data: attempts, timestamp: Date.now() });
}

export function useQuizAttempts({
  quizId,
  assignmentId,
  enabled = true,
}: UseQuizAttemptsOptions): QuizAttemptsState {
  const [attempts, setAttempts] = useState<QuizAttemptDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!quizId || !enabled) {
      setAttempts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);
    setError(null);

    const cachedAttempts = getCachedAttempts(quizId);

    if (cachedAttempts) {
      setAttempts(cachedAttempts);
      setIsLoading(false);
      return;
    }

    getAttemptsByQuiz(quizId)
      .then((data) => {
        if (isCancelled) return;
        setCachedAttempts(quizId, data);
        setAttempts(data);
        setError(null);
        setIsLoading(false);
      })
      .catch((nextError) => {
        if (isCancelled) return;
        setError(
          getRequestErrorMessage(nextError, "Unable to load quiz attempts."),
        );
        setAttempts([]);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [quizId, enabled, refreshKey]);

  const completedCount = useMemo(
    () => attempts.filter((attempt) => attempt.isCompleted).length,
    [attempts],
  );

  const hasActiveAttempt = useMemo(
    () => attempts.some((attempt) => !attempt.isCompleted),
    [attempts],
  );

  return useMemo(
    () => ({
      quizId: quizId ?? "",
      assignmentId,
      attempts,
      attemptsCompleted: completedCount,
      hasActiveAttempt,
      isLoading,
      error,
      refetch: () => {
        attemptsCache.delete(quizId ?? "");
        setRefreshKey((current) => current + 1);
      },
    }),
    [quizId, assignmentId, attempts, completedCount, hasActiveAttempt, isLoading, error],
  );
}
