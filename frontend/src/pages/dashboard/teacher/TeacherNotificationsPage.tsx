import { Bell, Inbox } from "../../../components/icons/AppIcons";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useNotifications } from "../../../app/providers/NotificationsProvider";
import { DashboardPageHeader } from "../../../features/dashboard/components/DashboardPageHeader";
import {
  DashboardButton,
  dashboardPageClassName,
} from "../../../features/dashboard/components/DashboardPrimitives";
import { SectionCard } from "../../../features/dashboard/components/SectionCard";
import { StatCard } from "../../../features/dashboard/components/StatCard";
import { NotificationList } from "../../../features/dashboard/components/notifications/NotificationsComponents";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";

export function TeacherNotificationsPage() {
  const meta = useDashboardPageMeta();
  const { currentUser } = useAuth();
  const {
    getNotificationsForRecipientIdentity,
    getUnreadCountForRecipientIdentity,
    markNotificationRead,
  } = useNotifications();

  const teacherViewer = currentUser?.role === "teacher" ? currentUser : null;
  const notifications = teacherViewer
    ? getNotificationsForRecipientIdentity(teacherViewer.id, teacherViewer.email)
    : [];
  const unreadCount = teacherViewer
    ? getUnreadCountForRecipientIdentity(teacherViewer.id, teacherViewer.email)
    : 0;

  return (
    <div className={dashboardPageClassName}>
      <DashboardPageHeader
        title={meta?.title ?? "Notifications"}
        subtitle={
          meta?.subtitle ??
          "Review in-app updates tied to your teacher workspace."
        }
        actions={
          teacherViewer ? (
            <DashboardButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                notifications.forEach((notification) =>
                  markNotificationRead(notification.id),
                );
              }}
              disabled={!unreadCount}
            >
              Mark all as read
            </DashboardButton>
          ) : null
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <StatCard
          title="Unread"
          value={String(unreadCount)}
          change={unreadCount ? "Still needs your review" : "You are caught up"}
          icon={Bell}
          iconClassName="bg-[var(--dashboard-brand-soft-alt)] text-[var(--dashboard-brand)]"
        />
        <StatCard
          title="Total"
          value={String(notifications.length)}
          change={
            notifications.length
              ? "In-app messages available"
              : "No teacher notifications yet"
          }
          icon={Inbox}
          iconClassName="bg-[var(--dashboard-warning-soft)] text-[var(--dashboard-warning)]"
        />
      </div>

      <SectionCard
        title="Teacher Inbox"
        description="In-app notifications stay here until you review them. Notifications are stored locally in this browser only — a backend notifications service is not connected yet, so they will not sync across devices or be delivered by email."
        contentClassName="space-y-5"
      >
        <NotificationList
          notifications={notifications}
          onMarkRead={(notification) => markNotificationRead(notification.id)}
        />
      </SectionCard>
    </div>
  );
}
