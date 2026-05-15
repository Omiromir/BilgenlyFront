namespace Bilgenly.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public Guid? RecipientUserId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string RelatedClassId { get; set; } = string.Empty;
    public string RelatedClassName { get; set; } = string.Empty;
    public string? InviteCode { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string? QuizId { get; set; }
    public string? QuizTitle { get; set; }
    public string? AssignmentId { get; set; }
    public string? AttemptId { get; set; }
    public string? FollowUpKind { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? Recipient { get; set; }
}
