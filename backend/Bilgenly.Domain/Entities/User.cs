namespace Bilgenly.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
}

