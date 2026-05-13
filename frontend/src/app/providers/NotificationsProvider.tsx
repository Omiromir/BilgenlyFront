import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildClassInvitationNotification,
  buildQuizFollowUpNotification,
  sortDashboardNotifications,
} from "../../features/dashboard/components/notifications/notificationUtils";
import type {
  ClassInvitationNotificationInput,
  DashboardNotification,
  ClassInvitationNotificationStatus,
  QuizFollowUpNotificationInput,
} from "../../features/dashboard/components/notifications/notificationTypes";
import {
  createDefaultUserSettings,
  getSettingsStorageScope,
  readUserSettings,
} from "../../features/dashboard/settings/userSettings";

const NOTIFICATIONS_STORAGE_KEY = "bilgenly_notifications";

interface NotificationsContextValue {
  notifications: DashboardNotification[];
  getNotificationsForRecipient: (recipientUserId: string) => DashboardNotification[];
  getNotificationsForRecipientIdentity: (
    recipientUserId: string | null | undefined,
    recipientEmail?: string | null,
  ) => DashboardNotification[];
  getUnreadCountForRecipient: (recipientUserId: string) => number;
  getUnreadCountForRecipientIdentity: (
    recipientUserId: string | null | undefined,
    recipientEmail?: string | null,
  ) => number;
  upsertClassInvitationNotification: (
    input: ClassInvitationNotificationInput,
  ) => DashboardNotification | null;
  sendQuizFollowUpNotification: (
    input: QuizFollowUpNotificationInput,
  ) => DashboardNotification | null;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (recipientUserId: string) => void;
  updateClassInvitationStatus: (
    notificationId: string,
    status: ClassInvitationNotificationStatus,
  ) => void;
  updateClassInvitationStatusByStudent: (
    relatedClassId: string,
    studentId: string,
    status: ClassInvitationNotificationStatus,
  ) => void;
  removeClassInvitationNotification: (
    relatedClassId: string,
    studentId: string,
  ) => void;
  syncClassInvitationMetadata: (
    relatedClassId: string,
    metadata: Pick<
      ClassInvitationNotificationInput,
      "relatedClassName" | "senderName" | "senderEmail"
    >,
  ) => void;
  removeNotificationsForClass: (relatedClassId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

function sanitizeNotificationRecord(
  notification: Partial<DashboardNotification>,
): DashboardNotification | null {
  if (
    typeof notification.id !== "string" ||
    (notification.type !== "class_invitation" &&
      notification.type !== "quiz_follow_up") ||
    typeof notification.recipientUserId !== "string" ||
    typeof notification.recipientEmail !== "string" ||
    typeof notification.relatedClassId !== "string" ||
    typeof notification.relatedClassName !== "string" ||
    typeof notification.senderName !== "string" ||
    typeof notification.senderEmail !== "string" ||
    typeof notification.studentId !== "string" ||
    typeof notification.studentName !== "string" ||
    typeof notification.studentEmail !== "string"
  ) {
    return null;
  }

  const timestamp =
    typeof notification.createdAt === "string"
      ? notification.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof notification.updatedAt === "string"
      ? notification.updatedAt
      : timestamp;
  const status =
    notification.status === "accepted" ||
    notification.status === "declined" ||
    notification.status === "removed"
      ? notification.status
      : notification.type === "quiz_follow_up"
        ? "sent"
        : "pending";

  if (notification.type === "quiz_follow_up") {
    if (
      typeof notification.quizId !== "string" ||
      typeof notification.quizTitle !== "string" ||
      typeof notification.assignmentId !== "string" ||
      (notification.followUpKind !== "needs_review" &&
        notification.followUpKind !== "reassign_quiz" &&
        notification.followUpKind !== "follow_up_practice")
    ) {
      return null;
    }

    return {
      id: notification.id,
      type: "quiz_follow_up",
      recipientUserId: notification.recipientUserId,
      recipientEmail: notification.recipientEmail,
      title:
        typeof notification.title === "string" && notification.title.trim()
          ? notification.title
          : `Assigned quiz follow-up: ${notification.quizTitle}`,
      message:
        typeof notification.message === "string" && notification.message.trim()
          ? notification.message
          : `${notification.senderName} added an assigned quiz follow-up for ${notification.quizTitle}.`,
      createdAt: timestamp,
      updatedAt,
      read: Boolean(notification.read),
      actionType: "open_assigned_quiz",
      relatedClassId: notification.relatedClassId,
      relatedClassName: notification.relatedClassName,
      senderName: notification.senderName,
      senderEmail: notification.senderEmail,
      studentId: notification.studentId,
      studentName: notification.studentName,
      studentEmail: notification.studentEmail,
      status: "sent",
      quizId: notification.quizId,
      quizTitle: notification.quizTitle,
      assignmentId: notification.assignmentId,
      followUpKind: notification.followUpKind,
    };
  }

  return {
    id: notification.id,
    type: "class_invitation",
    recipientUserId: notification.recipientUserId,
    recipientEmail: notification.recipientEmail,
    title:
      typeof notification.title === "string" && notification.title.trim()
        ? notification.title
        : `Class invite: ${notification.relatedClassName}`,
    message:
      typeof notification.message === "string" && notification.message.trim()
        ? notification.message
        : `${notification.senderName} invited you to join ${notification.relatedClassName}.`,
    createdAt: timestamp,
    updatedAt,
    read: Boolean(notification.read),
    actionType: "class_invitation",
    relatedClassId: notification.relatedClassId,
    relatedClassName: notification.relatedClassName,
    senderName: notification.senderName,
    senderEmail: notification.senderEmail,
    studentId: notification.studentId,
    studentName: notification.studentName,
    studentEmail: notification.studentEmail,
    status,
  };
}

interface NotificationsProviderProps {
  children: ReactNode;
}

function rebuildInvitationNotification(
  notification: DashboardNotification,
  status: ClassInvitationNotificationStatus,
): DashboardNotification {
  if (notification.type !== "class_invitation") {
    return notification;
  }

  return buildClassInvitationNotification(
    {
      recipientUserId: notification.recipientUserId,
      recipientEmail: notification.recipientEmail,
      relatedClassId: notification.relatedClassId,
      relatedClassName: notification.relatedClassName,
      senderName: notification.senderName,
      senderEmail: notification.senderEmail,
      studentId: notification.studentId,
      studentName: notification.studentName,
      studentEmail: notification.studentEmail,
    },
    {
      existingId: notification.id,
      createdAt: notification.createdAt,
      updatedAt: new Date().toISOString(),
      read: true,
      status,
    },
  );
}

function getNotificationRecipientSettings(
  recipientUserId: string | null | undefined,
  recipientEmail?: string | null,
) {
  const scope = getSettingsStorageScope({
    userId: recipientUserId,
    email: recipientEmail,
    role: null,
    token: null,
  });

  return readUserSettings(
    scope,
    createDefaultUserSettings({
      role: null,
      user: null,
    }),
  );
}

function isNotificationEnabled(
  notification: DashboardNotification,
  recipientUserId: string | null | undefined,
  recipientEmail?: string | null,
) {
  const recipientSettings = getNotificationRecipientSettings(
    recipientUserId,
    recipientEmail,
  );

  if (!recipientSettings.notifications.push.realTimeUpdates) {
    return false;
  }

  if (notification.type === "class_invitation") {
    return recipientSettings.notifications.email.quizAssignments;
  }

  if (notification.followUpKind === "needs_review") {
    return recipientSettings.notifications.email.gradingUpdates;
  }

  return recipientSettings.notifications.email.quizAssignments;
}

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedValue = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

    if (!savedValue) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedValue) as Partial<DashboardNotification>[];
      setNotifications(
        Array.isArray(parsed)
          ? sortDashboardNotifications(
              parsed
                .map(sanitizeNotificationRecord)
                .filter((item): item is DashboardNotification => item !== null),
            )
          : [],
      );
    } catch {
      setNotifications([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications),
    );
  }, [isHydrated, notifications]);

  const matchesRecipientIdentity = (
    notification: DashboardNotification,
    recipientUserId: string | null | undefined,
    recipientEmail?: string | null,
  ) => {
    const normalizedRecipientEmail = recipientEmail?.trim().toLowerCase();

    if (recipientUserId && notification.recipientUserId === recipientUserId) {
      return true;
    }

    if (
      normalizedRecipientEmail &&
      notification.recipientEmail.trim().toLowerCase() === normalizedRecipientEmail
    ) {
      return true;
    }

    return false;
  };

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      getNotificationsForRecipient: (recipientUserId) =>
        notifications.filter(
          (notification) =>
            notification.recipientUserId === recipientUserId &&
            isNotificationEnabled(
              notification,
              notification.recipientUserId,
              notification.recipientEmail,
            ),
        ),
      getNotificationsForRecipientIdentity: (recipientUserId, recipientEmail) =>
        notifications.filter(
          (notification) =>
            matchesRecipientIdentity(
              notification,
              recipientUserId,
              recipientEmail,
            ) &&
            isNotificationEnabled(notification, recipientUserId, recipientEmail),
        ),
      getUnreadCountForRecipient: (recipientUserId) =>
        notifications.filter(
          (notification) =>
            notification.recipientUserId === recipientUserId &&
            !notification.read &&
            isNotificationEnabled(
              notification,
              notification.recipientUserId,
              notification.recipientEmail,
            ),
        ).length,
      getUnreadCountForRecipientIdentity: (recipientUserId, recipientEmail) =>
        notifications.filter(
          (notification) =>
            matchesRecipientIdentity(notification, recipientUserId, recipientEmail) &&
            !notification.read &&
            isNotificationEnabled(notification, recipientUserId, recipientEmail),
        ).length,
      upsertClassInvitationNotification: (input) => {
        const existingNotification = notifications.find(
          (notification) =>
            notification.type === "class_invitation" &&
            notification.relatedClassId === input.relatedClassId &&
            notification.studentId === input.studentId,
        );

        const nextNotification = buildClassInvitationNotification(input, {
          existingId: existingNotification?.id,
          createdAt: existingNotification?.createdAt,
          updatedAt: new Date().toISOString(),
          read: false,
          status: "pending",
        });

        if (
          !isNotificationEnabled(
            nextNotification,
            input.recipientUserId,
            input.recipientEmail,
          )
        ) {
          return null;
        }

        setNotifications((current) =>
          sortDashboardNotifications(
            existingNotification
              ? current.map((notification) =>
                  notification.id === existingNotification.id
                    ? nextNotification
                    : notification,
                )
              : [nextNotification, ...current],
          ),
        );

        return nextNotification;
      },
      sendQuizFollowUpNotification: (input) => {
        const nextNotification = buildQuizFollowUpNotification(input, {
          updatedAt: new Date().toISOString(),
          read: false,
        });

        if (
          !isNotificationEnabled(
            nextNotification,
            input.recipientUserId,
            input.recipientEmail,
          )
        ) {
          return null;
        }

        setNotifications((current) =>
          sortDashboardNotifications([nextNotification, ...current]),
        );

        return nextNotification;
      },
      markNotificationRead: (notificationId) => {
        setNotifications((current) =>
          sortDashboardNotifications(
            current.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    read: true,
                    updatedAt: notification.updatedAt,
                  }
                : notification,
            ),
          ),
        );
      },
      markAllNotificationsRead: (recipientUserId) => {
        setNotifications((current) =>
          sortDashboardNotifications(
            current.map((notification) =>
              notification.recipientUserId === recipientUserId
                ? {
                    ...notification,
                    read: true,
                  }
                : notification,
            ),
          ),
        );
      },
      updateClassInvitationStatus: (notificationId, status) => {
        setNotifications((current) =>
          sortDashboardNotifications(
            current.map((notification) =>
              notification.id === notificationId
                ? rebuildInvitationNotification(notification, status)
                : notification,
            ),
          ),
        );
      },
      updateClassInvitationStatusByStudent: (relatedClassId, studentId, status) => {
        setNotifications((current) =>
          sortDashboardNotifications(
            current.map((notification) =>
              notification.type === "class_invitation" &&
              notification.relatedClassId === relatedClassId &&
              notification.studentId === studentId
                ? rebuildInvitationNotification(notification, status)
                : notification,
            ),
          ),
        );
      },
      removeClassInvitationNotification: (relatedClassId, studentId) => {
        setNotifications((current) =>
          current.filter(
            (notification) =>
              !(
                notification.type === "class_invitation" &&
                notification.relatedClassId === relatedClassId &&
                notification.studentId === studentId
              ),
          ),
        );
      },
      syncClassInvitationMetadata: (relatedClassId, metadata) => {
        setNotifications((current) =>
          sortDashboardNotifications(
            current.map((notification) =>
              notification.relatedClassId === relatedClassId &&
              notification.type === "class_invitation"
                ? buildClassInvitationNotification(
                    {
                      recipientUserId: notification.recipientUserId,
                      recipientEmail: notification.recipientEmail,
                      relatedClassId: notification.relatedClassId,
                      relatedClassName: metadata.relatedClassName,
                      senderName: metadata.senderName,
                      senderEmail: metadata.senderEmail,
                      studentId: notification.studentId,
                      studentName: notification.studentName,
                      studentEmail: notification.studentEmail,
                    },
                    {
                      existingId: notification.id,
                      createdAt: notification.createdAt,
                      updatedAt: new Date().toISOString(),
                      read: notification.read,
                      status: notification.status,
                    },
                  )
                : notification,
            ),
          ),
        );
      },
      removeNotificationsForClass: (relatedClassId) => {
        setNotifications((current) =>
          current.filter(
            (notification) => notification.relatedClassId !== relatedClassId,
          ),
        );
      },
    }),
    [notifications],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider.",
    );
  }

  return context;
}
