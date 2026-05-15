import { useEffect, useState } from "react";
import { Medal, Trophy } from "../../../components/icons/AppIcons";
import { CtaPanel } from "../../../features/dashboard/components/CtaPanel";
import { DashboardPageHeader } from "../../../features/dashboard/components/DashboardPageHeader";
import {
  DashboardSurface,
  dashboardPageClassName,
} from "../../../features/dashboard/components/DashboardPrimitives";
import { SectionCard } from "../../../features/dashboard/components/SectionCard";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";
import {
  getAchievements,
  type AchievementsDto,
} from "../../../features/gamification/api";
import { getRequestErrorMessage } from "../../../lib/apiClient";

export function StudentBadgesPage() {
  const meta = useDashboardPageMeta();
  const [data, setData] = useState<AchievementsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    getAchievements()
      .then((result) => {
        if (!isMounted) return;
        setData(result);
      })
      .catch((nextError) => {
        if (!isMounted) return;
        setError(
          getRequestErrorMessage(nextError, "Unable to load achievements."),
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const rankLabel = data?.rankLabel?.trim()
    ? data.rankLabel
    : data?.rank
      ? `#${data.rank}`
      : "Unranked";
  const formattedScore =
    data?.averageScore !== undefined
      ? `${Math.round(data.averageScore)}%`
      : "—";

  return (
    <div className={dashboardPageClassName}>
      <DashboardPageHeader
        title={meta?.title ?? "Achievements"}
        subtitle={meta?.subtitle ?? "Track your achievements and progress in class"}
      />

      <CtaPanel
        title={data ? `Your Rank: ${rankLabel}` : "Your Rank: —"}
        description={
          isLoading
            ? "Loading achievements…"
            : error
              ? error
              : data
                ? `Average score: ${formattedScore}. ${
                    data.badgesEarned
                  } of ${data.totalBadges} badges earned.`
                : "No achievements yet."
        }
        variant="gradient"
        aside={
          <div className="hidden h-40 w-40 items-center justify-center rounded-[28px] bg-white/12 lg:flex">
            <Trophy className="h-20 w-20 text-white/85" />
          </div>
        }
        actions={
          <div className="grid gap-10 text-white sm:grid-cols-3">
            <div>
              <p className="text-sm text-white/80">Average Score</p>
              <p className="mt-1 text-[2rem] font-semibold">{formattedScore}</p>
            </div>
            <div>
              <p className="text-sm text-white/80">Quizzes Done</p>
              <p className="mt-1 text-[2rem] font-semibold">
                {data?.quizzesDone ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/80">Badges Earned</p>
              <p className="mt-1 text-[2rem] font-semibold">
                {data?.badgesEarned ?? 0}
              </p>
            </div>
          </div>
        }
      />

      <SectionCard title="Your Badges">
        <div className="flex justify-end pb-5 text-sm text-[var(--dashboard-text-faint)]">
          {data ? `${data.badgesEarned} of ${data.totalBadges} earned` : "—"}
        </div>

        {isLoading ? (
          <DashboardSurface
            variant="muted"
            radius="md"
            padding="sm"
            className="border-dashed border-[var(--dashboard-border-soft)]"
          >
            <div className="py-8 text-center text-sm text-[var(--dashboard-text-soft)]">
              Loading badges…
            </div>
          </DashboardSurface>
        ) : data && data.badges.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.badges.map((badge) => (
              <DashboardSurface
                key={badge.badgeId}
                radius="md"
                padding="sm"
                className="border border-[var(--dashboard-border-soft)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dashboard-brand-soft-alt)] text-2xl">
                    {badge.icon || "🏅"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--dashboard-text-strong)]">
                      {badge.title}
                    </p>
                    <p className="text-sm text-[var(--dashboard-text-soft)]">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </DashboardSurface>
            ))}
          </div>
        ) : (
          <DashboardSurface
            variant="muted"
            radius="md"
            padding="sm"
            className="border-dashed border-[var(--dashboard-border-soft)]"
          >
            <div className="py-8 text-center">
              <p className="text-[1.05rem] font-semibold text-[var(--dashboard-text-strong)]">
                No badges yet
              </p>
            </div>
          </DashboardSurface>
        )}
      </SectionCard>

      <SectionCard title="Class Leaderboard">
        {isLoading ? (
          <p className="text-sm text-[var(--dashboard-text-soft)]">
            Loading leaderboard…
          </p>
        ) : data && data.leaderboard.length > 0 ? (
          <div className="space-y-4">
            {data.leaderboard.map((entry) => (
              <DashboardSurface
                asChild
                key={entry.userId}
                radius="md"
                padding="sm"
              >
                <article className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dashboard-warning)] text-sm font-semibold text-white">
                      {entry.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--dashboard-text-strong)]">
                        {entry.isCurrentUser ? "You" : entry.username}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[1.8rem] font-semibold text-[var(--dashboard-success)]">
                      {Math.round(entry.averageScore)}%
                    </span>
                    <Medal className="h-5 w-5 text-[var(--dashboard-success)]" />
                  </div>
                </article>
              </DashboardSurface>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--dashboard-text-soft)]">
            Leaderboard will appear once classes have completed quizzes.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
