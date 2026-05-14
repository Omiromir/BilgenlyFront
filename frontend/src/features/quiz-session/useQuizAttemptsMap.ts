import { useEffect, useState, useCallback, useMemo } from "react";
import { getAttemptsByQuiz } from "./api/attemptsApi";
import { useQuizSessions } from "../../app/providers/QuizSessionProvider";

interface UseQuizAttemptsMapOptions {
  quizIds: string[];
  enabled?: boolean;
}

export interface QuizAttemptsMap {
  [quizId: string]: number; // quiz ID to completed attempt count
}

export function useQuizAttemptsMap({
  quizIds,
  enabled = true,
}: UseQuizAttemptsMapOptions): QuizAttemptsMap {
  const [attemptsMap, setAttemptsMap] = useState<QuizAttemptsMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { sessions } = useQuizSessions();

  // Track which quizzes have completed sessions to trigger refetch
  const completedQuizIds = useMemo(
    () => new Set(
      sessions
        .filter((s) => s.status === "completed")
        .map((s) => s.quizId)
    ),
    [sessions]
  );

  const loadAttempts = useCallback(async () => {
    if (!enabled || quizIds.length === 0) {
      setAttemptsMap({});
      return;
    }

    setIsLoading(true);
    const map: QuizAttemptsMap = {};

    for (const quizId of quizIds) {
      try {
        const attempts = await getAttemptsByQuiz(quizId);
        map[quizId] = attempts.filter((a) => a.status === "completed").length;
      } catch (error) {
        console.error(`Failed to load attempts for quiz ${quizId}:`, error);
        map[quizId] = 0;
      }
    }

    setAttemptsMap(map);
    setIsLoading(false);
  }, [quizIds, enabled]);

  // Load on mount and when quizIds change
  useEffect(() => {
    loadAttempts();
  }, [quizIds, enabled, refreshKey, loadAttempts]);

  // Refetch when a quiz in our list has a new completed session
  useEffect(() => {
    const shouldRefetch = Array.from(completedQuizIds).some(
      (quizId) => quizIds.includes(quizId)
    );

    if (shouldRefetch && Object.keys(attemptsMap).length > 0) {
      // Only refetch if we've already loaded once and detected a new completion
      const timer = setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [completedQuizIds, quizIds, attemptsMap]);

  return attemptsMap;
}
