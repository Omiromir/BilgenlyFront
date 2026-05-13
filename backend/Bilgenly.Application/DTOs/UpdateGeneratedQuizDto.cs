namespace Bilgenly.Application.DTOs;

public class UpdateGeneratedQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public List<UpdateQuestionDto> Questions { get; set; } = new();
}