namespace Bilgenly.Domain.Entities;

public class Report
{
    public Guid Id { get; set; }
    public Guid ReporterId { get; set; }
    public Guid? ReportedQuizId { get; set; }
    public Guid? ReportedUserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Category { get; set; } = "other";
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewerId { get; set; }
    public string? ReviewNote { get; set; }

    public User? Reporter { get; set; }
    public Quiz? ReportedQuiz { get; set; }
    public User? ReportedUser { get; set; }
    public User? Reviewer { get; set; }
}
