namespace Bilgenly.Application.DTOs;

public class AttemptSummaryDto
{
    public Guid AttemptId { get; set; }
    public Guid QuizId  { get; set; }
    public string QuizTitle { get; set; }
    public int Score { get; set; }
    public DateTime DateTaken { get; set; }
    public bool IsCompleted { get; set; }
}