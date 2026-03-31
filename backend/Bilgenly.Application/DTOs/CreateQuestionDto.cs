namespace Bilgenly.Application.DTOs;

public class CreateQuestionDto
{
    public string Text  { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "MCQ";
    public int Position { get; set; }
    public List<CreateAnswerDto> Answers { get; set; } = new();
}