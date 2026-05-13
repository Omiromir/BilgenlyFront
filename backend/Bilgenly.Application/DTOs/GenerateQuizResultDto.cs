namespace Bilgenly.Application.DTOs;

public class GenerateQuizResultDto
{
    public Guid QuizId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int QuestionsGenerated { get; set; }
    public string SourceSummary { get; set; } = string.Empty;
    public double GenerationTimeSeconds { get; set; }
    public List<QuizQuestionReviewDto> Questions { get; set; } = new();
}