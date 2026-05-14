import { useEffect, useMemo, useState } from "react";
import type { QuizSessionRecord } from "../quiz-session/quizSessionTypes";
import {
  buildAssignmentConstraintState,
  type AssignmentConstraintSource,
} from "./assignmentConstraints";

interface UseAssignmentConstraintsOptions {
  assignment?: AssignmentConstraintSource | null;
  sessions?: QuizSessionRecord[];
  viewerRole?: "teacher" | "student";
  refreshIntervalMs?: number;
  backendAttemptCount?: number;
}

export function useAssignmentConstraints({
  assignment,
  sessions = [],
  viewerRole = "student",
  refreshIntervalMs = 30000,
  backendAttemptCount,
}: UseAssignmentConstraintsOptions) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!assignment?.deadline) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [assignment?.deadline, refreshIntervalMs]);

  return useMemo(
    () =>
      buildAssignmentConstraintState(
        assignment,
        sessions,
        viewerRole,
        now,
        backendAttemptCount,
      ),
    [assignment, now, sessions, viewerRole, backendAttemptCount],
  );
}
