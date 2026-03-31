namespace Bilgenly.Application.DTOs;

public class QuestionAnalyticsDto
{
    public Guid  QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int TotalAnswered { get; set; }
    public int CorrectAnswers { get; set; }
    public double CorrectPercentage { get; set; }
}