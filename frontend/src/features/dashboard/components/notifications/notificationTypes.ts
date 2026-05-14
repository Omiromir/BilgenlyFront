export type DashboardNotificationType = "class_invitation" | "quiz_follow_up";
export type ClassInvitationNotificationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "removed";
export type QuizFollowUpKind =
  | "needs_review"
  | "reassign_quiz"
  | "follow_up_practice";

interface DashboardNotificationBase {
  id: string;
  type: DashboardNotificationType;
  recipientUserId: string;
  recipientEmail: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
  relatedClassId: string;
  relatedClassName: string;
  senderName: string;
  senderEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

export interface ClassInvitationNotification extends DashboardNotificationBase {
  type: "class_invitation";
  actionType: "class_invitation";
  inviteCode: string;
  status: ClassInvitationNotificationStatus;
}

export interface QuizFollowUpNotification extends DashboardNotificationBase {
  type: "quiz_follow_up";
  actionType: "open_assigned_quiz";
  status: "sent";
  quizId: string;
  quizTitle: string;
  assignmentId: string;
  followUpKind: QuizFollowUpKind;
}

export type DashboardNotification =
  | ClassInvitationNotification
  | QuizFollowUpNotification;

export interface ClassInvitationNotificationInput {
  recipientUserId: string;
  recipientEmail: string;
  relatedClassId: string;
  relatedClassName: string;
  inviteCode: string;
  senderName: string;
  senderEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

export interface QuizFollowUpNotificationInput {
  recipientUserId: string;
  recipientEmail: string;
  relatedClassId: string;
  relatedClassName: string;
  senderName: string;
  senderEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizId: string;
  quizTitle: string;
  assignmentId: string;
  followUpKind: QuizFollowUpKind;
}
