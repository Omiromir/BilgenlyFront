namespace Bilgenly.Application.DTOs;

public class StudentSummaryDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public double AverageGradePercent { get; set; }
    public int CompletedQuizzesCount { get; set; }
    public int AttemptsCount { get; set; }
    public DateTime? LatestAttemptAt { get; set; }
    public int ClassesCount { get; set; }
    public string Status { get; set; } = "no_results";
}
