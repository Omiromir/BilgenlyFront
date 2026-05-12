namespace Bilgenly.Domain.Entities;

public class Assignment
{
    public Guid Id { get; set; }                                   
    public Guid ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public DateTime AssignedAt { get; set; }
    public DateTime? Deadline { get; set; }                        
    public int? MaxAttempts { get; set; }                           
    public bool AllowLateSubmissions { get; set; } = false;
    public string AssignedBy { get; set; } = string.Empty;          
    public string AssignedByName { get; set; } = string.Empty;      
    public string Visibility { get; set; } = "class-members";
    public string Status { get; set; } = "active";                  
}