using Bilgenly.Application.DTOs;
using Bilgenly.Application.Interfaces;

namespace Bilgenly.Infrastructure.Services;

public class AiServiceStub : IAiService // Zaglushka
{
    public Task<List<CreateQuestionDto>> GenerateFromTextAsync(
        string text, int questionCount, string topic,
        string topicFocus, string questionType, string additionalInstructions)
    {
        return Task.FromResult(GenerateMockQuestions(questionCount, topic));
    }

    public Task<List<CreateQuestionDto>> GenerateFromPdfAsync(
        byte[] fileBytes, int questionCount, string topic,
        string topicFocus, string questionType, string additionalInstructions)
    {
        return Task.FromResult(GenerateMockQuestions(questionCount, topic));
    }

    private List<CreateQuestionDto> GenerateMockQuestions(int count, string topic)
    {
        return Enumerable.Range(1, count).Select(i => new CreateQuestionDto
        {
            Text = $"Sample question {i} about {topic}?",
            QuestionType = "MCQ",
            Position = i,
            Answers = new List<CreateAnswerDto>
            {
                new() { Text = "Correct answer", IsCorrect = true },
                new() { Text = "Wrong answer 1", IsCorrect = false },
                new() { Text = "Wrong answer 2", IsCorrect = false },
                new() { Text = "Wrong answer 3", IsCorrect = false },
            }
        }).ToList();
    }
}