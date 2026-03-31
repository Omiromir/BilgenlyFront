namespace Bilgenly.Application.DTOs;

public class CreateQuizDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = false;
    public List <CreateQuestionDto> Questions { get; set; } = new();
}