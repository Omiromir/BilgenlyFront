namespace Bilgenly.Application.DTOs;

public class QuestionDto
{
    public Guid Id { get; set; }
    public string Text  { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public int Position { get; set; }
    public List<AnswerDto> Answers { get; set; } = new ();
}