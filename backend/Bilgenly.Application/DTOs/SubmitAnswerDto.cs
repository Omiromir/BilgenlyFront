namespace Bilgenly.Application.DTOs;

public class SubmitAnswerDto
{
    public Guid QuestionId { get; set; }
    public Guid AnswerId { get; set; }
}