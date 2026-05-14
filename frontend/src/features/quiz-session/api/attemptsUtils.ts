import type { QuizAttemptDto } from "./attemptsApi";

export interface AttemptEligibility {
  canStart: boolean;
  attemptsUsed: number;
  attemptsRemaining: number | null;
  exhausted: boolean;
  reason?: string;
}

export function checkAttemptEligibility(
  attempts: QuizAttemptDto[],
  maxAttempts: number | null | undefined,
  deadlinePassed?: boolean,
): AttemptEligibility {
  const completedCount = attempts.filter((a) => a.isCompleted).length;
  const hasUnlimited = maxAttempts === null || typeof maxAttempts !== "number";
  const attemptsRemaining = hasUnlimited
    ? null
    : Math.max((maxAttempts ?? 0) - completedCount, 0);
  const exhausted = !hasUnlimited && completedCount >= (maxAttempts ?? 0);

  if (deadlinePassed) {
    return {
      canStart: false,
      attemptsUsed: completedCount,
      attemptsRemaining,
      exhausted,
      reason: "Assignment deadline has passed",
    };
  }

  if (exhausted) {
    return {
      canStart: false,
      attemptsUsed: completedCount,
      attemptsRemaining,
      exhausted: true,
      reason: "All attempts have been used",
    };
  }

  return {
    canStart: true,
    attemptsUsed: completedCount,
    attemptsRemaining,
    exhausted: false,
  };
}

export function getAttemptProgressLabel(
  attemptsUsed: number,
  maxAttempts: number | null | undefined,
): string {
  if (maxAttempts === null || typeof maxAttempts !== "number") {
    return "Unlimited attempts";
  }

  return `${attemptsUsed} of ${maxAttempts} ${maxAttempts === 1 ? "attempt" : "attempts"} used`;
}
