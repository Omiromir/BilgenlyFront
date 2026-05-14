namespace Bilgenly.Application.DTOs;

public class AchievementsDto
{
    public int Rank { get; set; }
    public string RankLabel { get; set; } = string.Empty;  // "top 15%"
    public double AverageScore { get; set; }
    public int QuizzesDone { get; set; }
    public int BadgesEarned { get; set; }
    public int TotalBadges { get; set; }
    public List<UserBadgeDto> Badges { get; set; } = new();
    public List<LeaderboardEntryDto> Leaderboard { get; set; } = new();
}