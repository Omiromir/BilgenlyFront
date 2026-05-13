namespace Bilgenly.Application.DTOs;

public class ClassStudentDto
{
    public Guid StudentId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}