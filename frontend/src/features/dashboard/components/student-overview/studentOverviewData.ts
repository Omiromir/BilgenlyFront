import {
  BookOpen,
  Flame,
  Medal,
  TrendingUp,
  type LucideIcon,
} from "../../../../components/icons/AppIcons";
import type { QuizSessionRecord } from "../../../quiz-session/quizSessionTypes";
import {
  formatQuizAttemptDate,
  formatQuizPoints,
  getQuizSessionResultSummary,
} from "../../../quiz-session/quizSessionUtils";
import type { StudentQuizLibrarySources } from "../quiz-library/studentQuizLibrarySources";

export interface StudentOverviewStatItem {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconClassName: string;
}

export interface StudentOverviewRecentResultItem {
  title: string;
  date: string;
  score: string;
  detail: string;
  scoreTone: "blue" | "emerald";
}

interface StudentOverviewDataInput {
  studentSources: StudentQuizLibrarySources;
  completedSessions: QuizSessionRecord[];
}

function getLocalDayStart(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function pluralize(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}

function getStreaks(completedSessions: QuizSessionRecord[]) {
  const uniqueDayStarts = Array.from(
    new Set(
      completedSessions
        .map((session) => session.finishedAt ?? session.updatedAt)
        .map((value) => getLocalDayStart(value))
        .filter((date): date is Date => date !== null)
        .map((date) => date.getTime()),
    ),
  )
    .sort((left, right) => left - right)
    .map((value) => new Date(value));

  if (!uniqueDayStarts.length) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let runningBest = 1;

  for (let index = 1; index < uniqueDayStarts.length; index += 1) {
    const previous = uniqueDayStarts[index - 1];
    const current = uniqueDayStarts[index];
    const difference =
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
      runningBest += 1;
      best = Math.max(best, runningBest);
    } else {
      runningBest = 1;
    }
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const latestDay = uniqueDayStarts[uniqueDayStarts.length - 1];
  const gapFromToday =
    (todayStart.getTime() - latestDay.getTime()) / (1000 * 60 * 60 * 24);

  if (gapFromToday > 1) {
    return { current: 0, best };
  }

  let current = 1;

  for (let index = uniqueDayStarts.length - 1; index > 0; index -= 1) {
    const latest = uniqueDayStarts[index];
    const previous = uniqueDayStarts[index - 1];
    const difference =
      (latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (difference !== 1) {
      break;
    }

    current += 1;
  }

  return { current, best };
}

function getCompletedThisWeek(completedSessions: QuizSessionRecord[]) {
  const sevenDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;

  return completedSessions.filter((session) => {
    const completedAt = getTimestamp(session.finishedAt ?? session.updatedAt);
    return completedAt >= sevenDaysAgo;
  }).length;
}

function getUnlockedBadgeCount(
  studentSources: StudentQuizLibrarySources,
  completedSessions: QuizSessionRecord[],
  averageScore: number | null,
  perfectScores: number,
  currentStreak: number,
  completedThisWeek: number,
) {
  const assignmentCompletions = completedSessions.filter((session) =>
    Boolean(session.assignmentContext),
  ).length;
  const fastFinishes = completedSessions.filter((session) => {
    const startedAt = getTimestamp(session.startedAt);
    const finishedAt = getTimestamp(session.finishedAt ?? session.updatedAt);

    if (!startedAt || !finishedAt) {
      return false;
    }

    return finishedAt - startedAt <= 15 * 60 * 1000;
  }).length;

  const unlockedRules = [
    completedSessions.length >= 1,
    completedSessions.length >= 5,
    completedSessions.length >= 10,
    perfectScores >= 1,
    currentStreak >= 3,
    currentStreak >= 7,
    completedThisWeek >= 3,
    studentSources.activeMemberships.length >= 2,
    assignmentCompletions >= 3,
    averageScore !== null && averageScore >= 85 && completedSessions.length >= 3,
    averageScore !== null && averageScore >= 90 && completedSessions.length >= 5,
    fastFinishes >= 1,
  ];

  return unlockedRules.filter(Boolean).length;
}

function buildOverviewStats(
  studentSources: StudentQuizLibrarySources,
  completedSessions: QuizSessionRecord[],
) {
  const scores = completedSessions.map(
    (session) => getQuizSessionResultSummary(session).percentage,
  );
  const latestResult = completedSessions[0]
    ? getQuizSessionResultSummary(completedSessions[0])
    : null;
  const latestScore = scores[0] ?? null;
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : null;
  const perfectScores = scores.filter((score) => score === 100).length;
  const { current, best } = getStreaks(completedSessions);
  const completedThisWeek = getCompletedThisWeek(completedSessions);
  const badgeCount = getUnlockedBadgeCount(
    studentSources,
    completedSessions,
    averageScore,
    perfectScores,
    current,
    completedThisWeek,
  );

  return [
    {
      title: "Current Streak",
      value: pluralize(current, "day"),
      change:
        best > 0
          ? `Best: ${pluralize(best, "day")}`
          : "Finish quizzes on consecutive days to start a streak",
      icon: Flame,
      iconClassName:
        "bg-[var(--dashboard-brand-soft)] text-[var(--dashboard-brand-strong)]",
    },
    {
      title: "Quizzes Completed",
      value: String(completedSessions.length),
      change: completedThisWeek
        ? `+${completedThisWeek} this week`
        : "No finished quizzes this week yet",
      icon: BookOpen,
      iconClassName:
        "bg-[var(--dashboard-brand-soft-alt)] text-[var(--dashboard-brand)]",
    },
    {
      title: "Average Score",
      value: averageScore === null ? "--" : `${averageScore}%`,
      change:
        latestScore === null
          ? "Complete a quiz to track your progress"
          : `Latest result ${formatQuizPoints(
              latestResult?.earnedPoints ?? 0,
              latestResult?.totalPoints ?? 0,
            )} · ${latestScore}%`,
      icon: TrendingUp,
      iconClassName:
        "bg-[var(--dashboard-brand-soft)] text-[var(--dashboard-brand-strong)]",
    },
    {
      title: "Badges Earned",
      value: String(badgeCount),
      change:
        perfectScores > 0
          ? `${perfectScores} perfect score${perfectScores === 1 ? "" : "s"} unlocked`
          : "Calculated from real study activity",
      icon: Medal,
      iconClassName:
        "bg-[var(--dashboard-brand-soft)] text-[var(--dashboard-brand-strong)]",
    },
  ] satisfies StudentOverviewStatItem[];
}

function buildRecentResults(completedSessions: QuizSessionRecord[]) {
  return completedSessions.slice(0, 3).map((session) => {
    const result = getQuizSessionResultSummary(session);
    const score = result.percentage;

    return {
      title: session.quiz.title,
      date: formatQuizAttemptDate(session.finishedAt ?? session.updatedAt),
      score: `${score}%`,
      detail: formatQuizPoints(result.earnedPoints, result.totalPoints),
      scoreTone: score >= 90 ? "emerald" : "blue",
    } satisfies StudentOverviewRecentResultItem;
  });
}

export function buildStudentOverviewData({
  studentSources,
  completedSessions,
}: StudentOverviewDataInput) {
  return {
    stats: buildOverviewStats(studentSources, completedSessions),
    recentResults: buildRecentResults(completedSessions),
  };
}
