namespace Bilgenly.Application.DTOs;

public class AnswerReviewDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}