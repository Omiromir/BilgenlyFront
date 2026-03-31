namespace Bilgenly.Application.DTOs;

public class StartAttemptDto
{
    public Guid AttemptId { get; set; }
    public Guid QuizId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public List<QuestionForStudentDto> Questions { get; set; } = new();
}