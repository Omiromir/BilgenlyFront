namespace Bilgenly.Domain.Entities;

public class Quiz
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}