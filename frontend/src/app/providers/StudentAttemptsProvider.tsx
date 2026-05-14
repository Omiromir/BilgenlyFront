import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getMyAttempts, type MyAttemptDto } from "../../features/quiz-session/api/attemptsApi";
import { useQuizSessions } from "./QuizSessionProvider";
import { useAuth } from "./AuthProvider";

interface StudentAttemptsContextType {
  attempts: MyAttemptDto[];
  isLoading: boolean;
  error: string | null;
  refreshAttempts: () => Promise<void>;
}

const StudentAttemptsContext = createContext<StudentAttemptsContextType | null>(null);

interface StudentAttemptsProviderProps {
  children: React.ReactNode;
}

export function StudentAttemptsProvider({ children }: StudentAttemptsProviderProps) {
  const [attempts, setAttempts] = useState<MyAttemptDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { sessions } = useQuizSessions();
  const { role, token } = useAuth();

  // Track number of completed sessions to trigger refresh when a new one is completed
  const completedSessionCount = useMemo(
    () => sessions.filter((s) => s.status === "completed").length,
    [sessions]
  );

  const refreshAttempts = useCallback(async () => {
    if (!token || role !== "student") {
      setAttempts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyAttempts();
      setAttempts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load attempts";
      setError(message);
      console.error("Failed to load student attempts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [role, token]);

  // Initial load
  useEffect(() => {
    void refreshAttempts();
  }, [refreshAttempts, refreshKey]);

  // Auto-refresh when completed sessions change
  useEffect(() => {
    const timer = setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [completedSessionCount, role]);

  const value: StudentAttemptsContextType = useMemo(
    () => ({
      attempts,
      isLoading,
      error,
      refreshAttempts,
    }),
    [attempts, isLoading, error, refreshAttempts]
  );

  return (
    <StudentAttemptsContext.Provider value={value}>
      {children}
    </StudentAttemptsContext.Provider>
  );
}

export function useStudentAttempts(): StudentAttemptsContextType {
  const context = useContext(StudentAttemptsContext);

  if (!context) {
    throw new Error("useStudentAttempts must be used within StudentAttemptsProvider");
  }

  return context;
}
