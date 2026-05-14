namespace Bilgenly.Application.DTOs;

public class UserBadgeDto
{
    public Guid BadgeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
}