namespace Bilgenly.Domain.Entities;

public class Class
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public string InviteCode { get; set; } = string.Empty;
    public bool IsArchived { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>(); // ← было ClassQuizzes
}