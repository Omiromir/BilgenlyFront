namespace Bilgenly.Application.DTOs;

public class SubmitAttemptDto
{
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}