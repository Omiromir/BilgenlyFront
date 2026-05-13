import { BookOpen, Medal, Timer } from "../../../components/icons/AppIcons";
import { Link } from "react-router";
import { useMemo } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useTeacherClasses } from "../../../app/providers/TeacherClassesProvider";
import { useQuizLibrary } from "../../../app/providers/QuizLibraryProvider";
import { useQuizSessions } from "../../../app/providers/QuizSessionProvider";
import logoPng from "../../../assets/logo.png";
import { cn } from "../../../components/ui/utils";
import { CtaPanel } from "../../../features/dashboard/components/CtaPanel";
import { DashboardPageHeader } from "../../../features/dashboard/components/DashboardPageHeader";
import {
  DashboardButton,
  DashboardSurface,
  dashboardIconTextRowClassName,
  dashboardPageClassName,
  dashboardSectionStackClassName,
  dashboardSplitGridClassName,
  dashboardStatsGridClassName,
  dashboardTextToneClassName,
} from "../../../features/dashboard/components/DashboardPrimitives";
import { EmptyAssignedQuizzesState } from "../../../features/dashboard/components/quiz-library/QuizLibraryComponents";
import { buildStudentQuizLibrarySources } from "../../../features/dashboard/components/quiz-library/studentQuizLibrarySources";
import { useQuizLauncher } from "../../../features/quiz-session/useQuizLauncher";
import { SectionCard } from "../../../features/dashboard/components/SectionCard";
import { StatCard } from "../../../features/dashboard/components/StatCard";
import {
  buildStudentOverviewData,
} from "../../../features/dashboard/components/student-overview/studentOverviewData";

const scoreToneClassName = {
  blue: dashboardTextToneClassName.brand,
  emerald: dashboardTextToneClassName.success,
} as const;

export function StudentOverviewPage() {
  const { currentUser } = useAuth();
  const { classes } = useTeacherClasses();
  const { quizzes } = useQuizLibrary();
  const { getCompletedSessionsForRole, sessions } = useQuizSessions();
  const { openQuiz } = useQuizLauncher();
  const studentViewer = currentUser?.role === "student" ? currentUser : null;
  const studentIdentity = useMemo(
    () => ({
      userId: studentViewer?.id,
      email: studentViewer?.email,
    }),
    [studentViewer?.email, studentViewer?.id],
  );
  const studentSources = useMemo(
    () => buildStudentQuizLibrarySources(classes, quizzes, studentIdentity, sessions),
    [classes, quizzes, sessions, studentIdentity],
  );
  const completedSessions = useMemo(
    () => getCompletedSessionsForRole("student"),
    [getCompletedSessionsForRole],
  );
  const overview = useMemo(
    () =>
      buildStudentOverviewData({
        studentSources,
        completedSessions,
      }),
    [completedSessions, studentSources],
  );
  const assignedPreview = useMemo(
    () =>
      [...studentSources.assigned]
        .sort(
          (left, right) =>
            new Date(right.assignmentContext.assignedAt).getTime() -
            new Date(left.assignmentContext.assignedAt).getTime(),
        )
        .slice(0, 3),
    [studentSources.assigned],
  );

  const getAssignedStatusLabel = (status: string) => {
    if (status === "completed") {
      return "Completed";
    }

    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "expired") {
      return "Expired";
    }

    if (status === "attempts_exhausted") {
      return "No attempts left";
    }

    return "Available";
  };

  const getAssignedStatusClassName = (status: string) => {
    if (status === "completed") {
      return "text-[var(--dashboard-success)]";
    }

    if (status === "in_progress") {
      return "text-[var(--dashboard-brand)]";
    }

    if (status === "expired") {
      return "text-[var(--dashboard-danger)]";
    }

    if (status === "attempts_exhausted") {
      return "text-[var(--dashboard-text-soft)]";
    }

    return "text-[var(--dashboard-warning)]";
  };

  const getAssignedEmptyState = () => {
    if (studentSources.pendingMemberships.length) {
      return {
        title: "Accept your class invite",
        description:
          "A pending class invite is waiting in Notifications. Accept it to unlock assigned quizzes for that class.",
      };
    }

    if (!studentSources.activeMemberships.length) {
      return {
        title: "No class memberships yet",
        description:
          "Assigned quizzes will appear here after you join a class through the class invite flow.",
      };
    }

    return {
      title: "No assigned quizzes yet",
      description:
        "You are already part of a class, but no assigned quizzes are available there yet.",
    };
  };

  const assignedEmptyState = getAssignedEmptyState();
  const assignedCount = studentSources.assigned.length;

  return (
    <div className={dashboardPageClassName}>
      <DashboardPageHeader
        title="Welcome back, Student!"
        subtitle="Keep up the great work on your learning journey."
      />

      <CtaPanel
        title="Continue Your Learning"
        description={
          assignedCount
            ? `You have ${assignedCount} class-assigned ${assignedCount === 1 ? "quiz" : "quizzes"} ready. Jump back in and keep your streak going.`
            : "Jump into your quiz library, discover new practice sets, and stay ready for your next assigned quiz."
        }
        variant="gradient"
        actions={
          <>
            <DashboardButton asChild variant="inverse" size="xl">
              <Link to="/dashboard/student/classes">
                Open My Classes
              </Link>
            </DashboardButton>
            <DashboardButton asChild variant="hero" size="xl">
              <Link to="/dashboard/student/quiz-library">
                Open Quiz Library
              </Link>
            </DashboardButton>
          </>
        }
        aside={
          <div className="hidden h-40 w-40 items-center justify-center rounded-[28px] bg-white/12 lg:flex">
            <img
              src={logoPng}
              alt="Bilgenly"
              className="h-20 w-20 object-contain opacity-95"
            />
          </div>
        }
      />

      <div className={dashboardStatsGridClassName}>
        {overview.stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className={dashboardSplitGridClassName}>
        <SectionCard title="Assigned Quizzes">
          <div className={dashboardSectionStackClassName}>
            {assignedPreview.length ? (
              assignedPreview.map((assignment) => (
                <DashboardSurface
                  asChild
                  key={assignment.assignmentContext.assignmentId}
                  radius="md"
                  padding="sm"
                >
                  <article>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[1.15rem] font-semibold text-[var(--dashboard-text-strong)]">
                          {assignment.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--dashboard-text-soft)]">
                          {assignment.assignmentContext.className}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-5 text-sm text-[var(--dashboard-text-soft)]">
                          <span className={dashboardIconTextRowClassName}>
                            <BookOpen className="h-4 w-4" />
                            {assignment.questionCount}{" "}
                            {assignment.questionCount === 1 ? "question" : "questions"}
                          </span>
                          <span className={dashboardIconTextRowClassName}>
                            <Timer className="h-4 w-4" />
                            {assignment.durationMinutes} min
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          getAssignedStatusClassName(assignment.assignmentState.status),
                        )}
                      >
                        {getAssignedStatusLabel(assignment.assignmentState.status)}
                      </span>
                    </div>

                    <DashboardButton
                      type="button"
                      size="lg"
                      className="mt-5 w-full"
                      onClick={() =>
                        openQuiz({
                          quizId: assignment.id,
                          viewerRole: "student",
                          assignmentId: assignment.assignmentContext.assignmentId,
                          preferredSession:
                            assignment.assignmentState.status === "completed"
                              ? "completed"
                              : assignment.assignmentState.status === "in_progress"
                                ? "in-progress"
                                : undefined,
                          navigationState: {
                            launchSourceType: "overview",
                            launchSourceLabel: "Student overview",
                            returnToPath: "/dashboard/student/overview",
                            returnToLabel: "Back to overview",
                          },
                        })
                      }
                    >
                        {assignment.assignmentState.status === "in_progress"
                          ? "Continue Quiz"
                          : assignment.assignmentState.status === "completed"
                            ? "View Results"
                            : assignment.assignmentState.status === "expired" ||
                                assignment.assignmentState.status ===
                                  "attempts_exhausted"
                              ? "Open Assigned Quiz"
                              : "Start Assigned Quiz"}
                    </DashboardButton>
                  </article>
                </DashboardSurface>
              ))
            ) : (
              <EmptyAssignedQuizzesState
                title={assignedEmptyState.title}
                description={assignedEmptyState.description}
              />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent Results">
          <div className={dashboardSectionStackClassName}>
            {overview.recentResults.length ? (
              overview.recentResults.map((result, index) => (
                <article
                  key={`${result.title}-${result.date}`}
                  className="flex items-start justify-between gap-4 rounded-[18px] px-3 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 text-[var(--dashboard-warning)]">
                      {index < 2 ? (
                        <Medal className="h-5 w-5" />
                      ) : (
                        <span className="inline-block h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[1.12rem] font-semibold text-[var(--dashboard-text-strong)]">
                        {result.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--dashboard-text-faint)]">{result.date}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[1.8rem] font-semibold tracking-[-0.03em]",
                      scoreToneClassName[result.scoreTone],
                    )}
                  >
                    {result.score}
                  </span>
                </article>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-5 py-6">
                <p className="font-semibold text-[var(--dashboard-text-strong)]">
                  No recent results yet
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-text-soft)]">
                  Finish your first quiz and your latest scores will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
