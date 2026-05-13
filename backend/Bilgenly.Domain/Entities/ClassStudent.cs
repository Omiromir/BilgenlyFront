namespace Bilgenly.Domain.Entities;

public class ClassStudent
{
    public Guid ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
}