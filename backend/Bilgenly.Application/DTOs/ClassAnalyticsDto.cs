namespace Bilgenly.Application.DTOs;

public class ClassAnalyticsDto
{
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public Guid AssignmentId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public int TotalStudents { get; set; }
    public int CompletedCount { get; set; }
    public int InProgressCount { get; set; }
    public int MissedDeadlineCount { get; set; }
    public int NeedsAttentionCount { get; set; }   
    public double CompletionRate { get; set; }
    public double? AverageScore { get; set; }
    public double AvgAttemptsUsed { get; set; }
    public DateTime? Deadline { get; set; }
    public int? MaxAttempts { get; set; }
    public List<StudentAssignmentResultDto> StudentResults { get; set; } = new();
    public List<QuestionAnalyticsDto> QuestionStats { get; set; } = new();
}
