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
    public DateTime? LastAttemptAt { get; set; }
    public bool MissedDeadline { get; set; }
}