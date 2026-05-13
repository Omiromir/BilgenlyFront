namespace Bilgenly.Application.DTOs;

public class ClassQuizDto
{
    public Guid QuizId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}