namespace Bilgenly.Application.DTOs;

public class ClassQuizDto
{
    public Guid AssignmentId { get; set; }
    public Guid QuizId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? Deadline { get; set; }
    public int? MaxAttempts { get; set; }
    public bool AllowLateSubmissions { get; set; }
    public string AssignedBy { get; set; } = string.Empty;
    public string AssignedByName { get; set; } = string.Empty;
    public string Visibility { get; set; } = "class-members";
    public string Status { get; set; } = "active";
}
