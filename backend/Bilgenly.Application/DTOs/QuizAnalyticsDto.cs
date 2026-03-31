namespace Bilgenly.Application.DTOs;

public class QuizAnalyticsDto
{
    public Guid QuizId { get; set; }
    public string QuizTitle { get; set; } = String.Empty;
    public int TotalAttempts { get; set; }
    public double AverageScore { get; set; }
    public int HighestScore { get; set; }
    public int LowestScore { get; set; }
    public List<QuestionAnalyticsDto> Questions { get; set; } = new();
}