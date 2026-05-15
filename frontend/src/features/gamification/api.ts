import { apiRequest } from "../../lib/apiClient";

export interface UserBadgeDto {
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  username: string;
  averageScore: number;
  isCurrentUser: boolean;
}

export interface AchievementsDto {
  rank: number;
  rankLabel: string;
  averageScore: number;
  quizzesDone: number;
  badgesEarned: number;
  totalBadges: number;
  badges: UserBadgeDto[];
  leaderboard: LeaderboardEntryDto[];
}

export function getAchievements() {
  return apiRequest<AchievementsDto>("/api/achievements", {
    fallbackErrorMessage: "Unable to load achievements.",
  });
}
