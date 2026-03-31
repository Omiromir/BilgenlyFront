namespace Bilgenly.Application.DTOs;

public class QuestionForStudentDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public int Position { get; set; }
    public List<AnswerForStudentDto> Answers { get; set; } = new();
}