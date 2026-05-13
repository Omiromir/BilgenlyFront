import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Award,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "../../../components/icons/AppIcons";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useQuizSessions } from "../../../app/providers/QuizSessionProvider";
import { DashboardPageHeader } from "../../../features/dashboard/components/DashboardPageHeader";
import {
  DashboardButton,
  DashboardSearchField,
  dashboardIconTextRowClassName,
  dashboardPageClassName,
  dashboardStatsGridClassName,
} from "../../../features/dashboard/components/DashboardPrimitives";
import { SectionCard } from "../../../features/dashboard/components/SectionCard";
import { StatCard } from "../../../features/dashboard/components/StatCard";
import { buildQuizSessionPath, buildQuizSessionSearch } from "../../../features/quiz-session/quizRouting";
import {
  formatQuizAttemptDate,
  formatQuizAttemptDuration,
  formatQuizScore,
  getQuizSessionResultSummary,
} from "../../../features/quiz-session/quizSessionUtils";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";
import { LoadingCard } from "../../../features/dashboard/components/LoadingCard";
import { useMyAnalytics } from "../../../features/dashboard/hooks/useDashboardAnalytics";

const summaryIcons = [TrendingUp, CheckCircle2, Award, Clock3] as const;
const summaryColors = [
  "bg-[var(--dashboard-brand-soft-alt)] text-[var(--dashboard-brand)]",
  "bg-[var(--dashboard-brand-soft-alt)] text-[var(--dashboard-brand)]",
  "bg-[var(--dashboard-brand-soft)] text-[var(--dashboard-brand-strong)]",
  "bg-[var(--dashboard-brand-soft)] text-[var(--dashboard-brand-strong)]",
] as const;

function buildSessionLink(sessionId: string, quizId: string, assignmentId?: string) {
  return `${buildQuizSessionPath("student", quizId)}${buildQuizSessionSearch({
    sessionId,
    assignmentId,
  })}`;
}

function buildQuizLink(quizId: string, assignmentId?: string) {
  return `${buildQuizSessionPath("student", quizId)}${buildQuizSessionSearch({
    assignmentId,
  })}`;
}

export function StudentResultsPage() {
  const meta = useDashboardPageMeta();
  const analyticsState = useMyAnalytics();
  const { getCompletedSessionsForRole } = useQuizSessions();
  const completedSessions = getCompletedSessionsForRole("student");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const attemptSummaries = analyticsState.data?.attempts ?? [];
  const usingLocalFallback = Boolean(analyticsState.error);

  const summary = useMemo(() => {
    if (!attemptSummaries.length && !completedSessions.length) {
      return [
        {
          label: "Average Score",
          value: "--",
          note: "Complete a quiz to see your trend.",
        },
        {
          label: "Quizzes Completed",
          value: "0",
          note: "Your finished attempts will appear here.",
        },
        {
          label: "Best Score",
          value: "--",
          note: "No attempts yet.",
        },
        {
          label: "Latest Score",
          value: "--",
          note: "Start with any library or class quiz.",
        },
      ];
    }

    const percentages = attemptSummaries.length
      ? attemptSummaries.map((attempt) => attempt.score)
      : completedSessions.map(
          (session) => getQuizSessionResultSummary(session).percentage,
        );
    const latestScore = percentages[0];
    const averageScore = attemptSummaries.length
      ? Math.round(analyticsState.data?.averageScore ?? 0)
      : Math.round(
          percentages.reduce((total, value) => total + value, 0) / percentages.length,
        );
    const bestScore = Math.max(...percentages);
    const completedCount = attemptSummaries.length || completedSessions.length;

    return [
      {
        label: "Average Score",
        value: formatQuizScore(averageScore),
        note: `${completedCount} completed ${completedCount === 1 ? "quiz" : "quizzes"}`,
      },
      {
        label: "Quizzes Completed",
        value: String(completedCount),
        note: "Across class and self-study attempts.",
      },
      {
        label: "Best Score",
        value: formatQuizScore(bestScore),
        note:
          bestScore === 100
            ? "Perfect result unlocked."
            : "Your strongest attempt so far.",
      },
      {
        label: "Latest Score",
        value: formatQuizScore(latestScore),
        note: `Recorded ${formatQuizAttemptDate(
          attemptSummaries[0]?.dateTaken ??
            completedSessions[0]?.finishedAt ??
            completedSessions[0]?.updatedAt ??
            new Date().toISOString(),
        )}`,
      },
    ];
  }, [analyticsState.data?.averageScore, attemptSummaries, completedSessions]);

  const progressData = useMemo(
    () =>
      (attemptSummaries.length ? attemptSummaries : completedSessions)
        .slice(0, 6)
        .reverse()
        .map((attemptOrSession, index) => ({
          label: `Attempt ${index + 1}`,
          value:
            "score" in attemptOrSession
              ? attemptOrSession.score
              : getQuizSessionResultSummary(attemptOrSession).percentage,
        })),
    [attemptSummaries, completedSessions],
  );

  const recentResults = useMemo(
    () =>
      (attemptSummaries.length
        ? attemptSummaries
        : completedSessions.map((session) => ({
            attemptId: session.id,
            quizId: session.quizId,
            quizTitle: session.quiz.title,
            score: getQuizSessionResultSummary(session).percentage,
            dateTaken: session.finishedAt ?? session.updatedAt,
            isCompleted: true,
          })))
        .filter((attempt) => {
          const query = deferredSearch.trim().toLowerCase();

          if (!query) {
            return true;
          }

          return [
            attempt.quizTitle,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        })
        .slice(0, 5)
        .map((attempt) => {
          const matchedSession =
            completedSessions.find(
              (session) =>
                session.quizId === attempt.quizId &&
                Math.abs(
                  new Date(session.finishedAt ?? session.updatedAt).getTime() -
                    new Date(attempt.dateTaken).getTime(),
                ) <
                  5 * 60 * 1000,
            ) ?? null;
          const result = matchedSession
            ? getQuizSessionResultSummary(matchedSession)
            : {
                percentage: attempt.score,
                correctCount: 0,
                incorrectCount: 0,
                totalQuestions: 0,
              };

          return {
            attempt,
            session: matchedSession,
            result,
            reviewHref: matchedSession
              ? buildSessionLink(
                  matchedSession.id,
                  matchedSession.quizId,
                  matchedSession.assignmentContext?.assignmentId,
                )
              : null,
            retakeHref: buildQuizLink(
              attempt.quizId,
              matchedSession?.assignmentContext?.assignmentId,
            ),
          };
        }),
    [attemptSummaries, completedSessions, deferredSearch],
  );

  if (analyticsState.isLoading && !attemptSummaries.length && !completedSessions.length) {
    return (
      <div className={dashboardPageClassName}>
        <DashboardPageHeader
          title={meta?.title ?? "My Results"}
          subtitle="Track real quiz attempts, review what you missed, and jump back into practice from one place."
        />

        <div className="space-y-4">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardPageClassName}>
      <DashboardPageHeader
        title={meta?.title ?? "My Results"}
        subtitle="Track real quiz attempts, review what you missed, and jump back into practice from one place."
      />

      {usingLocalFallback ? (
        <EmptyStateBlock
          title="Backend analytics are unavailable"
          description={`${analyticsState.error} Showing local session history only where it is available.`}
          icon={TrendingUp}
          className="border-dashed"
        />
      ) : null}

      <div className={dashboardStatsGridClassName}>
        {summary.map((item, index) => {
          const Icon = summaryIcons[index];

          return (
            <StatCard
              key={item.label}
              title={item.label}
              value={item.value}
              change={item.note}
              icon={Icon}
              iconClassName={summaryColors[index]}
            />
          );
        })}
      </div>

      <SectionCard title="Score Progress">
        {progressData.length ? (
          <>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressData}
                  margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
                >
                  <CartesianGrid stroke="#E8EDF6" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#62708B", fontSize: 12 }}
                    axisLine={{ stroke: "#D9E1EF" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#62708B", fontSize: 12 }}
                    axisLine={{ stroke: "#D9E1EF" }}
                    tickLine={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#16B59D"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[var(--dashboard-brand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--dashboard-brand)]" />
              Score %
            </div>
          </>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-5 py-6">
            <p className="font-semibold text-[var(--dashboard-text-strong)]">
              No score data yet
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-text-soft)]">
              Finish your first quiz and the recent score trend will appear here automatically.
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Recent Quiz Results"
        description="Search by quiz title, topic, or source to jump straight to the result or assigned quiz review you want."
        contentClassName="space-y-5"
      >
        <DashboardSearchField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search results by quiz title, topic, or source..."
          inputClassName="border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)]"
        />

        {recentResults.length ? (
          <div className="space-y-5">
            {recentResults.map(({ attempt, session, result, reviewHref, retakeHref }) => (
              <article
                key={attempt.attemptId}
                className="rounded-[22px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] px-5 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[1.18rem] font-semibold text-[var(--dashboard-text-strong)]">
                      {attempt.quizTitle}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--dashboard-text-soft)]">
                      {formatQuizAttemptDate(attempt.dateTaken)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[2rem] font-semibold text-[var(--dashboard-brand)]">
                      {formatQuizScore(result.percentage)}
                    </p>
                    <p className="text-sm text-[var(--dashboard-text-soft)]">
                      {result.totalQuestions
                        ? `${result.correctCount}/${result.totalQuestions} correct`
                        : "Summary only"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 text-sm text-[var(--dashboard-text-soft)] md:grid-cols-2">
                  <div className={dashboardIconTextRowClassName}>
                    <CheckCircle2 className="h-4 w-4 text-[var(--dashboard-brand)]" />
                    Correct: {result.totalQuestions ? result.correctCount : "--"}
                  </div>
                  <div className={dashboardIconTextRowClassName}>
                    <Award className="h-4 w-4 text-[var(--dashboard-brand-strong)]" />
                    Incorrect: {result.totalQuestions ? result.incorrectCount : "--"}
                  </div>
                  <div className={dashboardIconTextRowClassName}>
                    <Clock3 className="h-4 w-4 text-[var(--dashboard-brand)]" />
                    Time: {session ? formatQuizAttemptDuration(session) : "--"}
                  </div>
                  <div className={dashboardIconTextRowClassName}>
                    <TrendingUp className="h-4 w-4 text-[var(--dashboard-brand)]" />
                    Source: {session ? (session.assignmentContext ? "Assigned quiz" : session.sourceLabel) : "Analytics summary"}
                  </div>
                </div>

                <div className="mt-5 rounded-[12px] border border-[var(--dashboard-border)] bg-[var(--dashboard-brand-soft-alt)] px-4 py-3 text-sm text-[var(--dashboard-text-strong)]">
                  {reviewHref
                    ? "Review feedback is saved with this attempt. Open the result to revisit each answer, explanation, and any Review Request context tied to this assigned quiz."
                    : "Detailed per-question review is not available for this backend summary yet, but you can reopen the quiz from your library or class workspace."}
                </div>

                <div className="mt-5 flex gap-3">
                  {reviewHref ? (
                    <DashboardButton asChild type="button" size="lg" className="flex-1">
                      <Link to={reviewHref}>Review Answers</Link>
                    </DashboardButton>
                  ) : (
                    <DashboardButton type="button" size="lg" className="flex-1" disabled>
                      Review Answers
                    </DashboardButton>
                  )}
                  <DashboardButton asChild type="button" variant="secondary" size="lg">
                    <Link to={retakeHref}>
                      {session?.assignmentContext ? "Open Assigned Quiz" : "Retake Quiz"}
                    </Link>
                  </DashboardButton>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-5 py-6">
            <p className="font-semibold text-[var(--dashboard-text-strong)]">
              {search.trim() ? "No quiz results match this search" : "No completed quiz attempts yet"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-text-soft)]">
              {search.trim()
                ? "Try a different title, topic, or source keyword to find the result you need."
                : "Start a quiz from your library or classes, finish it, and the full results history will appear here."}
            </p>
            {!search.trim() ? (
              <DashboardButton asChild type="button" size="lg" className="mt-5">
                <Link to="/dashboard/student/quiz-library">Open Quiz Library</Link>
              </DashboardButton>
            ) : null}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
