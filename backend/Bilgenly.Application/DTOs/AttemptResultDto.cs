namespace Bilgenly.Application.DTOs;

public class AttemptResultDto
{
    public Guid AttemptId { get; set; }
    public string QuizTitle { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public List<QuestionResultDto> Questions { get; set; } = new();
}