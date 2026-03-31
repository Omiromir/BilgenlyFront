namespace Bilgenly.Domain.Entities;

public class AttemptAnswer
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    public Attempt Attempt { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public Guid AnswerId { get; set; }
    public Answer Answer { get; set; } = null!;
    public bool IsCorrect { get; set; }
}