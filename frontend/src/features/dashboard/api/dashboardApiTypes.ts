export interface ClassStudentDto {
  studentId: string;
  username: string;
  email: string;
  joinedAt: string;
}

export interface ClassQuizDto {
  quizId: string;
  quizTitle: string;
  assignedAt: string;
}

export interface ClassDto {
  id: string;
  name: string;
  subject: string;
  description: string;
  teacherName: string;
  inviteCode: string;
  isArchived: boolean;
  studentCount: number;
  quizCount: number;
  createdAt: string;
  updatedAt: string;
  students: ClassStudentDto[];
  quizzes: ClassQuizDto[];
}

export interface CreateClassRequest {
  name: string;
  subject: string;
  description: string;
}

export type UpdateClassRequest = CreateClassRequest;

export interface AssignmentDto {
  id: string;
  assignmentId: string;
  classId: string;
  quizId: string;
  title: string;
  topic: string;
  questionCount: number;
  assignedAt: string;
  deadline: string | null;
  maxAttempts: number | null;
  allowLateSubmissions: boolean;
  assignedBy: string;
  assignedByName: string;
  visibility: string;
  status: string;
}

export interface AssignQuizToClassRequest {
  quizId: string;
  deadline: string | null;
  maxAttempts: number | null;
  allowLateSubmissions: boolean;
}

export interface JoinClassRequest {
  inviteCode: string;
}

export interface StudentAssignmentResultDto {
  studentId: string;
  studentName: string;
  email: string;
  status: string;
  attemptsUsed: number;
  attemptsRemaining: number | null;
  latestScore: number | null;
  bestScore: number | null;
  lastAttemptAt: string | null;
  missedDeadline: boolean;
}

export interface QuestionAnalyticsDto {
  questionId: string;
  questionText: string;
  totalAnswered: number;
  correctAnswers: number;
  correctPercentage: number;
}

export interface AssignmentAnalyticsDto {
  classId: string;
  className: string;
  assignmentId: string;
  quizTitle: string;
  questionCount: number;
  totalStudents: number;
  completedCount: number;
  inProgressCount: number;
  missedDeadlineCount: number;
  needsAttentionCount: number;
  completionRate: number;
  averageScore: number | null;
  avgAttemptsUsed: number;
  deadline: string | null;
  maxAttempts: number | null;
  studentResults: StudentAssignmentResultDto[];
  questionStats: QuestionAnalyticsDto[];
}

export interface QuizAnalyticsDto {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  questions: QuestionAnalyticsDto[];
}

export interface AttemptSummaryDto {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  dateTaken: string;
  isCompleted: boolean;
}

export interface MyAnalyticsDto {
  userId: string;
  username: string;
  totalAttempts: number;
  averageScore: number;
  attempts: AttemptSummaryDto[];
}

export interface CreateQuizAnswerRequest {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuizQuestionRequest {
  text: string;
  questionType: string;
  position: number;
  answers: CreateQuizAnswerRequest[];
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  isPublic: boolean;
  questions: CreateQuizQuestionRequest[];
}

export interface QuizAnswerDto {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionDto {
  id: string;
  text: string;
  questionType: string;
  position: number;
  answers: QuizAnswerDto[];
}

export interface QuizDto {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  questions: QuizQuestionDto[];
}
