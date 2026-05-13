using Bilgenly.Application.DTOs;
using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Services;

public class QuizGenerationService
{
    private readonly IAiService _aiService;
    private readonly IQuizRepository _quizRepository;

    public QuizGenerationService(IAiService aiService, IQuizRepository quizRepository)
    {
        _aiService = aiService;
        _quizRepository = quizRepository;
    }

    public async Task<(GenerateQuizResultDto? Result, string? Error)> GenerateFromTextAsync(
        GenerateQuizConfigDto config, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(config.Text) || config.Text.Length < 180)
            return (null, "Text must be at least 180 characters");

        if (config.QuestionCount < 5 || config.QuestionCount > 15)
            return (null, "Question count must be between 5 and 15");

        var startTime = DateTime.UtcNow;

        try
        {
            var questions = await _aiService.GenerateFromTextAsync(
                config.Text,
                config.QuestionCount,
                config.Topic,
                config.TopicFocus,
                config.QuestionType,
                config.AdditionalInstructions);

            return await SaveGeneratedQuiz(
                questions, config, userId, "text",
                "Pasted lecture text", startTime);
        }
        catch (Exception e)
        {
            return (null, $"AI generation failed: {e.Message}");
        }
    }

    
    public async Task<(GenerateQuizResultDto? Result, string? Error)> GenerateFromPdfAsync(
        byte[] fileBytes, GenerateQuizConfigDto config, Guid userId)
    {
        if (config.QuestionCount < 5 || config.QuestionCount > 15)
            return (null, "Question count must be between 5 and 15");

        var startTime = DateTime.UtcNow;

        try
        {
            var questions = await _aiService.GenerateFromPdfAsync(
                fileBytes,
                config.QuestionCount,
                config.Topic,
                config.TopicFocus,
                config.QuestionType,
                config.AdditionalInstructions);

            return await SaveGeneratedQuiz(
                questions, config, userId, "pdf",
                "Uploaded PDF", startTime);
        }
        catch (Exception e)
        {
            return (null, $"AI generation failed: {e.Message}");
        }
    }

    
    public async Task<(GenerateQuizResultDto? Result, string? Error)> RegenerateAsync(
        Guid quizId, Guid userId)
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz is null) return (null, "Quiz not found");
        if (quiz.UserId != userId) return (null, "Access denied");

       
        var config = new GenerateQuizConfigDto
        {
            Title = quiz.Title,
            Topic = quiz.Topic,
            TopicFocus = quiz.TopicFocus,
            QuestionCount = quiz.Questions.Count,
            QuestionType = "MCQ"
        };

        
        quiz.Questions.Clear();
        await _quizRepository.SaveChangesAsync();

        return (null, "Regeneration requires original source — please generate a new quiz");
    }

    public async Task<(GenerateQuizResultDto? Result, string? Error)> UpdateAfterReviewAsync(
        Guid quizId, UpdateGeneratedQuizDto dto, Guid userId)
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz is null) return (null, "Quiz not found");
        if (quiz.UserId != userId) return (null, "Access denied");

        quiz.Title = dto.Title;
        quiz.Description = dto.Description;
        quiz.IsPublic = dto.IsPublic;
        quiz.Status = dto.IsPublic ? "published-public" : "published-private";

        quiz.Questions.Clear();
        quiz.Questions = dto.Questions.Select((q, index) => new Question
        {
            Id = q.Id ?? Guid.NewGuid(),
            QuizId = quiz.Id,
            Text = q.Text,
            QuestionType = q.QuestionType,
            Explanation = q.Explanation,
            Position = q.Position > 0 ? q.Position : index + 1,
            Answers = q.Answers.Select(a => new Answer
            {
                Id = a.Id ?? Guid.NewGuid(),
                Text = a.Text,
                IsCorrect = a.IsCorrect
            }).ToList()
        }).ToList();

        await _quizRepository.SaveChangesAsync();

        return (MapToResult(quiz, "Edited by teacher", 0), null);
    }

    private async Task<(GenerateQuizResultDto? Result, string? Error)> SaveGeneratedQuiz(
        List<CreateQuestionDto> generatedQuestions,
        GenerateQuizConfigDto config,
        Guid userId,
        string sourceType,
        string sourceSummary,
        DateTime startTime)
    {
        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            Title = config.Title,
            Description = string.Empty,
            Topic = config.Topic,
            TopicFocus = config.TopicFocus,
            SourceType = sourceType,
            Status = "generated",
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            IsPublic = false,
            Questions = generatedQuestions.Select((q, index) => new Question
            {
                Id = Guid.NewGuid(),
                Text = q.Text,
                QuestionType = q.QuestionType,
                Position = q.Position > 0 ? q.Position : index + 1,
                Answers = q.Answers.Select(a => new Answer
                {
                    Id = Guid.NewGuid(),
                    Text = a.Text,
                    IsCorrect = a.IsCorrect
                }).ToList()
            }).ToList()
        };

        await _quizRepository.AddAsync(quiz);
        await _quizRepository.SaveChangesAsync();

        var generationTime = (DateTime.UtcNow - startTime).TotalSeconds;
        return (MapToResult(quiz, sourceSummary, generationTime), null);
    }

    private GenerateQuizResultDto MapToResult(Quiz quiz, string sourceSummary, double generationTime)
        => new()
        {
            QuizId = quiz.Id,
            Status = quiz.Status,
            QuestionsGenerated = quiz.Questions.Count,
            SourceSummary = sourceSummary,
            GenerationTimeSeconds = Math.Round(generationTime, 1),
            Questions = quiz.Questions.Select(q => new QuizQuestionReviewDto
            {
                Id = q.Id,
                Text = q.Text,
                QuestionType = q.QuestionType,
                Explanation = q.Explanation,
                Position = q.Position,
                Answers = q.Answers.Select(a => new AnswerReviewDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect
                }).ToList()
            }).OrderBy(q => q.Position).ToList()
        };
}