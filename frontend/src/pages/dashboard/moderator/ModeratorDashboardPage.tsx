import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { ShieldCheck } from "../../../components/icons/AppIcons";
import { apiRequest, getRequestErrorMessage } from "../../../lib/apiClient";
import { DashboardPageHeader } from "../../../features/dashboard/components/DashboardPageHeader";
import { EmptyStateBlock } from "../../../features/dashboard/components/EmptyStateBlock";
import { SectionCard } from "../../../features/dashboard/components/SectionCard";
import { StatCard } from "../../../features/dashboard/components/StatCard";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";
import { dashboardPageClassName } from "../../../features/dashboard/components/DashboardPrimitives";

interface PublicQuizRow {
  id: string;
  title: string;
  topic?: string;
  ownerName?: string;
  questionCount?: number;
  visibility?: string;
}

export function ModeratorDashboardPage() {
  const meta = useDashboardPageMeta();
  const { currentUser } = useAuth();
  const [publicQuizzes, setPublicQuizzes] = useState<PublicQuizRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Moderators can read quizzes they own from the public quiz library; no
    // dedicated backend moderation endpoints (reports, approvals, bans) exist
    // yet, so this list represents the moderator's own catalog only.
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    apiRequest<PublicQuizRow[]>("/api/Quiz/My", {
      fallbackErrorMessage: "Unable to load quizzes for moderation overview.",
    })
      .then((quizzes) => {
        if (!isMounted) return;
        setPublicQuizzes(Array.isArray(quizzes) ? quizzes : []);
      })
      .catch((nextError) => {
        if (!isMounted) return;
        setLoadError(
          getRequestErrorMessage(
            nextError,
            "Unable to load quizzes for moderation overview.",
          ),
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={dashboardPageClassName}>
      <DashboardPageHeader
        title={meta?.title ?? "Moderator Dashboard"}
        subtitle={
          meta?.subtitle ??
          `Signed in as ${currentUser?.fullName ?? "moderator"}. Review quizzes and content quality here.`
        }
        badge={meta?.badge}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Quizzes in catalog"
          value={isLoading ? "…" : String(publicQuizzes.length)}
          change="Visible to this moderator account"
          icon={ShieldCheck}
          iconClassName="bg-[var(--dashboard-brand-soft-alt)] text-[var(--dashboard-brand)]"
        />
        <StatCard
          title="Reports queue"
          value="—"
          change="Reporting backend not connected yet"
          icon={ShieldCheck}
          iconClassName="bg-[var(--dashboard-warning-soft)] text-[var(--dashboard-warning)]"
        />
        <StatCard
          title="Pending review"
          value="—"
          change="Approval backend not connected yet"
          icon={ShieldCheck}
          iconClassName="bg-[var(--dashboard-warning-soft)] text-[var(--dashboard-warning)]"
        />
      </div>

      <SectionCard
        title="Quiz catalog"
        description="Quizzes the backend exposes to this moderator account. Approve / reject / hide actions will appear here once the moderation backend is connected."
      >
        {loadError ? (
          <EmptyStateBlock
            title="Could not load quizzes"
            description={loadError}
          />
        ) : isLoading ? (
          <p className="text-sm text-[var(--dashboard-text-soft)]">
            Loading quizzes…
          </p>
        ) : publicQuizzes.length === 0 ? (
          <EmptyStateBlock
            title="No quizzes available"
            description="When quizzes are created or reported, they will show up here."
          />
        ) : (
          <ul className="space-y-3">
            {publicQuizzes.slice(0, 20).map((quiz) => (
              <li
                key={quiz.id}
                className="flex flex-col gap-1 rounded-[16px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] px-4 py-3"
              >
                <p className="text-[15px] font-semibold text-[var(--dashboard-text-strong)]">
                  {quiz.title}
                </p>
                <p className="text-sm text-[var(--dashboard-text-soft)]">
                  {quiz.topic ?? "—"}
                  {quiz.questionCount ? ` · ${quiz.questionCount} questions` : ""}
                  {quiz.ownerName ? ` · by ${quiz.ownerName}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Moderation actions"
        description="Approve, reject, hide quiz, or suspend user."
      >
        <EmptyStateBlock
          title="Moderation backend is not connected yet"
          description="Approve / reject / hide quiz and ban / suspend user endpoints have not been implemented on the backend. The frontend will wire these up automatically once the API exists."
        />
      </SectionCard>
    </div>
  );
}
