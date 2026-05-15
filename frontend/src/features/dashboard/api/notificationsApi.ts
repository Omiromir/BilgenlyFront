import { apiRequest } from "../../../lib/apiClient";

export interface BackendNotificationDto {
  id: string;
  type: string;
  recipientUserId: string;
  recipientEmail: string;
  title: string;
  message: string;
  read: boolean;
  actionType: string;
  relatedClassId: string;
  relatedClassName: string;
  inviteCode: string | null;
  senderName: string;
  senderEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  quizId: string | null;
  quizTitle: string | null;
  assignmentId: string | null;
  attemptId: string | null;
  followUpKind: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBackendNotificationDto {
  type: string;
  recipientUserId: string;
  recipientEmail: string;
  title: string;
  message: string;
  actionType: string;
  relatedClassId: string;
  relatedClassName: string;
  inviteCode?: string | null;
  senderName: string;
  senderEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  quizId?: string | null;
  quizTitle?: string | null;
  assignmentId?: string | null;
  attemptId?: string | null;
  followUpKind?: string | null;
  createdAt?: string | null;
  existingId?: string | null;
}

export function getMyNotifications() {
  return apiRequest<BackendNotificationDto[]>("/api/notifications", {
    fallbackErrorMessage: "Unable to load notifications.",
  });
}

export function upsertClassInvitationNotification(dto: CreateBackendNotificationDto) {
  return apiRequest<BackendNotificationDto>("/api/notifications/class-invitation", {
    method: "POST",
    body: dto,
    fallbackErrorMessage: "Unable to save class invitation notification.",
  });
}

export function createQuizFollowUpNotification(dto: CreateBackendNotificationDto) {
  return apiRequest<BackendNotificationDto>("/api/notifications/quiz-follow-up", {
    method: "POST",
    body: dto,
    fallbackErrorMessage: "Unable to save quiz follow-up notification.",
  });
}

export function markNotificationReadApi(notificationId: string) {
  return apiRequest<BackendNotificationDto>(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    fallbackErrorMessage: "Unable to mark notification as read.",
  });
}

export function markAllNotificationsReadApi() {
  return apiRequest<void>("/api/notifications/read-all", {
    method: "PUT",
    fallbackErrorMessage: "Unable to mark notifications as read.",
  });
}

export function updateNotificationStatusApi(notificationId: string, status: string) {
  return apiRequest<BackendNotificationDto>(`/api/notifications/${notificationId}/status`, {
    method: "PUT",
    body: { status },
    fallbackErrorMessage: "Unable to update notification status.",
  });
}

export function deleteNotificationApi(notificationId: string) {
  return apiRequest<void>(`/api/notifications/${notificationId}`, {
    method: "DELETE",
    fallbackErrorMessage: "Unable to delete notification.",
  });
}

export function deleteNotificationsForClassApi(relatedClassId: string) {
  return apiRequest<void>(`/api/notifications/class/${encodeURIComponent(relatedClassId)}`, {
    method: "DELETE",
    fallbackErrorMessage: "Unable to delete class notifications.",
  });
}
