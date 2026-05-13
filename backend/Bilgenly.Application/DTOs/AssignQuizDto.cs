namespace Bilgenly.Application.DTOs;

public class AssignQuizDto
{
    public Guid QuizId { get; set; }
    public DateTime? Deadline { get; set; }
    public int? MaxAttempts { get; set; }          
    public bool AllowLateSubmissions { get; set; } = false;
}