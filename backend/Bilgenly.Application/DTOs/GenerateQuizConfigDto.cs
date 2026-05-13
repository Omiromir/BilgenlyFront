namespace Bilgenly.Application.DTOs;

public class GenerateQuizConfigDto
{
    public string Title { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string TopicFocus { get; set; } = string.Empty;
    public int QuestionCount { get; set; } = 5;             
    public string QuestionType { get; set; } = "MCQ";        
    public string AdditionalInstructions { get; set; } = string.Empty;
    public string SourceType { get; set; } = "text";         
    public string? Text { get; set; }        
}