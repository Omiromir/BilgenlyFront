namespace Bilgenly.Domain.Entities;

public class Question
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public string Text { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "MCQ";
    public int Position { get; set; }
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();

}