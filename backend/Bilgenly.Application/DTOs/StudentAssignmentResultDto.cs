namespace Bilgenly.Application.DTOs;

public class StudentAssignmentResultDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;  
    public int AttemptsUsed { get; set; }
    public int? AttemptsRemaining { get; set; }
    public int? LatestScore { get; set; }
    public int? BestScore { get; set; }
    public double? AverageScore { get; set; }
    public Guid? LatestAttemptId { get; set; }
    public DateTime? LastAttemptAt { get; set; }
    public int? TotalQuestions { get; set; }
    public int? CorrectAnswers { get; set; }
    public int? IncorrectAnswers { get; set; }
    public int? ResponsesCount { get; set; }
    public bool HasDetailedResponses { get; set; }
    public List<StudentAttemptAnalyticsDto> Attempts { get; set; } = new();
    public List<MyAttemptQuestionReviewDto> LatestAttemptQuestions { get; set; } = new();
    public bool MissedDeadline { get; set; }
}

public class StudentAttemptAnalyticsDto
{
    public Guid AttemptId { get; set; }
    public int Score { get; set; }
    public DateTime SubmittedAt { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public int ResponsesCount { get; set; }
}
