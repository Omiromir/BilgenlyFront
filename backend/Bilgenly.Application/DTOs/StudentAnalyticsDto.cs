namespace Bilgenly.Application.DTOs;

public class StudentAnalyticsDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalAttempts { get; set; }
    public double AverageScore { get; set; }
    public List<AttemptSummaryDto> Attempts { get; set; } = new();
}