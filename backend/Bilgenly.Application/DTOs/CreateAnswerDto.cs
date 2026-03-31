namespace Bilgenly.Application.DTOs;

public class CreateAnswerDto
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}