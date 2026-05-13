import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Users,
} from "../../../../components/icons/AppIcons";
import { EmptyStateBlock } from "../EmptyStateBlock";
import {
  DashboardBadge,
  DashboardButton,
  DashboardSurface,
} from "../DashboardPrimitives";
import type { StrugglingTopicOverviewItem } from "./teacherOverviewData";

interface StrugglingTopicsListProps {
  topics: StrugglingTopicOverviewItem[];
  onViewAnalytics: (topic: StrugglingTopicOverviewItem) => void;
  onCreateRemedialQuiz: (topic: StrugglingTopicOverviewItem) => void;
}

function getMasteryTone(mastery: number) {
  if (mastery < 50) {
    return "danger" as const;
  }

  if (mastery < 70) {
    return "warning" as const;
  }

  return "success" as const;
}

export function StrugglingTopicsList({
  topics,
  onViewAnalytics,
  onCreateRemedialQuiz,
}: StrugglingTopicsListProps) {
  if (!topics.length) {
    return (
      <EmptyStateBlock
        title="Topic-level insights will appear here"
        description="Once assigned quizzes include tagged questions and students complete attempts, this section will surface the weakest concepts automatically."
        icon={TrendingUp}
      />
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => {
        const masteryTone = getMasteryTone(topic.averageMastery);

        return (
          <DashboardSurface
            asChild
            key={topic.topicLabel}
            radius="md"
            padding="sm"
          >
            <article className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[1.15rem] font-semibold text-[var(--dashboard-text-strong)]">
                      {topic.topicLabel}
                    </h3>
                    <DashboardBadge tone={masteryTone}>
                      {topic.averageMastery}% mastery
                    </DashboardBadge>
                  </div>
                  <p className="text-sm leading-6 text-[var(--dashboard-text-soft)]">
                    {topic.strugglingStudentsCount} of {topic.studentsTracked} tracked
                    students are still struggling with this concept across{" "}
                    {topic.relatedAssignmentsCount} assigned{" "}
                    {topic.relatedAssignmentsCount === 1 ? "quiz" : "quizzes"}.
                  </p>
                </div>

                <div className="min-w-[124px] rounded-[18px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)] px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text-faint)]">
                    Students struggling
                  </p>
                  <p className="mt-1 text-[1.55rem] font-semibold tracking-[-0.03em] text-[var(--dashboard-text-strong)]">
                    {topic.strugglingStudentsCount}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text-faint)]">
                  <span>Average mastery</span>
                  <span>{topic.averageMastery}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--dashboard-surface-muted)]">
                  <div
                    className={
                      masteryTone === "danger"
                        ? "h-full rounded-full bg-[var(--dashboard-danger)]"
                        : masteryTone === "warning"
                          ? "h-full rounded-full bg-[var(--dashboard-warning)]"
                          : "h-full rounded-full bg-[var(--dashboard-success)]"
                    }
                    style={{ width: `${Math.max(topic.averageMastery, 6)}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text-faint)]">
                    Mastery
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--dashboard-text-strong)]">
                    <BookOpen className="h-4 w-4 text-[var(--dashboard-brand)]" />
                    {topic.averageMastery}% average
                  </p>
                </div>
                <div className="rounded-[18px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text-faint)]">
                    Students
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--dashboard-text-strong)]">
                    <Users className="h-4 w-4 text-[var(--dashboard-brand)]" />
                    {topic.studentsTracked} tracked
                  </p>
                </div>
                <div className="rounded-[18px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--dashboard-text-faint)]">
                    Intervention
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--dashboard-warning)]">
                    <AlertCircle className="h-4 w-4" />
                    {topic.strugglingStudentsCount} need support
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <DashboardButton
                  type="button"
                  size="lg"
                  className="flex-1 sm:flex-none"
                  onClick={() => onViewAnalytics(topic)}
                >
                  View Analytics
                </DashboardButton>
                <DashboardButton
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => onCreateRemedialQuiz(topic)}
                >
                  Create Remedial Quiz
                  <ArrowRight className="h-4 w-4" />
                </DashboardButton>
              </div>
            </article>
          </DashboardSurface>
        );
      })}
    </div>
  );
}
