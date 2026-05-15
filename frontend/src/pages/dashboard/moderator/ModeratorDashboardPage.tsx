import { useEffect, useState } from "react";
import { DashboardPageHeader } from "../../../features/dashboard/components/DashboardPageHeader";
import { SectionCard } from "../../../features/dashboard/components/SectionCard";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";
import type {
  ModeratorDashboardDto,
  ReportDto,
  SuspendedUserDto,
  HiddenQuizDto,
} from "../../../features/dashboard/api/moderationApi";
import {
  getModeratorDashboard,
  getAllReports,
  reviewReport,
  getSuspendedUsers,
  unsuspendUser,
  getHiddenQuizzes,
  unhideQuiz,
} from "../../../features/dashboard/api/moderationApi";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    reviewed: "bg-emerald-100 text-emerald-700",
    dismissed: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] p-5">
      <span className={`text-3xl font-bold ${accent ?? "text-[var(--dashboard-text-strong)]"}`}>
        {value}
      </span>
      <span className="text-sm text-[var(--dashboard-text-soft)]">{label}</span>
    </div>
  );
}

export function ModeratorDashboardPage() {
  const meta = useDashboardPageMeta();
  const [stats, setStats] = useState<ModeratorDashboardDto | null>(null);
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUserDto[]>([]);
  const [hiddenQuizzes, setHiddenQuizzes] = useState<HiddenQuizDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "quizzes">("reports");

  useEffect(() => {
    Promise.allSettled([
      getModeratorDashboard(),
      getAllReports(),
      getSuspendedUsers(),
      getHiddenQuizzes(),
    ]).then(([dashboardResult, reportsResult, usersResult, quizzesResult]) => {
      if (dashboardResult.status === "fulfilled") setStats(dashboardResult.value);
      else setError("Unable to load dashboard data.");
      if (reportsResult.status === "fulfilled") setReports(reportsResult.value);
      if (usersResult.status === "fulfilled") setSuspendedUsers(usersResult.value);
      if (quizzesResult.status === "fulfilled") setHiddenQuizzes(quizzesResult.value);
      setLoading(false);
    });
  }, []);

  async function handleReviewReport(reportId: string, status: "reviewed" | "dismissed") {
    try {
      const updated = await reviewReport(reportId, { status });
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      if (stats) {
        setStats({
          ...stats,
          pendingReportsCount: Math.max(0, stats.pendingReportsCount - 1),
          recentReports: stats.recentReports.filter((r) => r.id !== reportId),
        });
      }
    } catch {
      // report the error silently
    }
  }

  async function handleUnsuspendUser(userId: string) {
    try {
      await unsuspendUser(userId);
      setSuspendedUsers((prev) => prev.filter((u) => u.id !== userId));
      if (stats) {
        setStats({ ...stats, activeSuspensionsCount: Math.max(0, stats.activeSuspensionsCount - 1) });
      }
    } catch {
      // report the error silently
    }
  }

  async function handleUnhideQuiz(quizId: string) {
    try {
      await unhideQuiz(quizId);
      setHiddenQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      if (stats) {
        setStats({ ...stats, hiddenQuizzesCount: Math.max(0, stats.hiddenQuizzesCount - 1) });
      }
    } catch {
      // report the error silently
    }
  }

  const tabs = [
    { key: "reports" as const, label: "Reports", count: reports.filter((r) => r.status === "pending").length },
    { key: "users" as const, label: "Suspended Users", count: suspendedUsers.length },
    { key: "quizzes" as const, label: "Hidden Quizzes", count: hiddenQuizzes.length },
  ];

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={meta?.title ?? "Moderator Dashboard"}
        subtitle={meta?.subtitle ?? "Review reports, manage suspensions, and moderate content."}
        badge={meta?.badge}
      />

      {error && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-[var(--dashboard-text-soft)]">Loading dashboard…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Pending Reports"
              value={stats?.pendingReportsCount ?? 0}
              accent={stats && stats.pendingReportsCount > 0 ? "text-amber-600" : undefined}
            />
            <StatCard
              label="Active Suspensions"
              value={stats?.activeSuspensionsCount ?? 0}
              accent={stats && stats.activeSuspensionsCount > 0 ? "text-red-500" : undefined}
            />
            <StatCard label="Hidden Quizzes" value={stats?.hiddenQuizzesCount ?? 0} />
          </div>

          <div className="flex gap-2 border-b border-[var(--dashboard-border-soft)]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-[var(--dashboard-accent)] text-[var(--dashboard-accent)]"
                    : "border-transparent text-[var(--dashboard-text-soft)] hover:text-[var(--dashboard-text-main)]"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="rounded-full bg-[var(--dashboard-accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "reports" && (
            <SectionCard title="Reports" description="User-submitted content and conduct reports.">
              {reports.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--dashboard-text-soft)]">
                  No reports yet.
                </p>
              ) : (
                <div className="divide-y divide-[var(--dashboard-border-soft)]">
                  {reports.map((report) => (
                    <div key={report.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={report.status} />
                          <span className="text-xs text-[var(--dashboard-text-faint)]">
                            {report.category}
                          </span>
                          <span className="text-xs text-[var(--dashboard-text-faint)]">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[var(--dashboard-text-strong)]">
                          {report.reportedQuizTitle
                            ? `Quiz: "${report.reportedQuizTitle}"`
                            : report.reportedUserName
                              ? `User: ${report.reportedUserName}`
                              : "Unknown target"}
                        </p>
                        <p className="text-sm text-[var(--dashboard-text-soft)]">{report.reason}</p>
                        <p className="text-xs text-[var(--dashboard-text-faint)]">
                          By: {report.reporterName}
                        </p>
                      </div>
                      {report.status === "pending" && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => handleReviewReport(report.id, "reviewed")}
                            className="rounded-[8px] bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleReviewReport(report.id, "dismissed")}
                            className="rounded-[8px] border border-[var(--dashboard-border-soft)] px-3 py-1.5 text-xs font-medium text-[var(--dashboard-text-soft)] hover:text-[var(--dashboard-text-main)]"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {activeTab === "users" && (
            <SectionCard title="Suspended Users" description="Currently suspended accounts.">
              {suspendedUsers.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--dashboard-text-soft)]">
                  No suspended users.
                </p>
              ) : (
                <div className="divide-y divide-[var(--dashboard-border-soft)]">
                  {suspendedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-[var(--dashboard-text-strong)]">
                          {user.username}
                        </p>
                        <p className="text-xs text-[var(--dashboard-text-soft)]">{user.email}</p>
                        {user.suspensionReason && (
                          <p className="text-xs text-[var(--dashboard-text-faint)]">
                            Reason: {user.suspensionReason}
                          </p>
                        )}
                        {user.suspendedUntil && (
                          <p className="text-xs text-[var(--dashboard-text-faint)]">
                            Until: {formatDate(user.suspendedUntil)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnsuspendUser(user.id)}
                        className="rounded-[8px] border border-[var(--dashboard-border-soft)] px-3 py-1.5 text-xs font-medium text-[var(--dashboard-text-soft)] hover:text-[var(--dashboard-text-main)]"
                      >
                        Unsuspend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {activeTab === "quizzes" && (
            <SectionCard title="Hidden Quizzes" description="Quizzes hidden from the public library.">
              {hiddenQuizzes.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--dashboard-text-soft)]">
                  No hidden quizzes.
                </p>
              ) : (
                <div className="divide-y divide-[var(--dashboard-border-soft)]">
                  {hiddenQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-[var(--dashboard-text-strong)]">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-[var(--dashboard-text-soft)]">
                          By: {quiz.authorName} · {formatDate(quiz.createdAt)}
                        </p>
                        {quiz.moderationNote && (
                          <p className="text-xs text-[var(--dashboard-text-faint)]">
                            Note: {quiz.moderationNote}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnhideQuiz(quiz.id)}
                        className="rounded-[8px] border border-[var(--dashboard-border-soft)] px-3 py-1.5 text-xs font-medium text-[var(--dashboard-text-soft)] hover:text-[var(--dashboard-text-main)]"
                      >
                        Unhide
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}
