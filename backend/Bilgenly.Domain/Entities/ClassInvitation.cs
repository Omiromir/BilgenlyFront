namespace Bilgenly.Domain.Entities;

public class ClassInvitation
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Guid TeacherId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }

    public Class? Class { get; set; }
    public User? Teacher { get; set; }
}
