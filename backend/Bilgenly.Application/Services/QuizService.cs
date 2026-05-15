using Bilgenly.Application.DTOs;
using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
namespace Bilgenly.Application.Services;

public class QuizService
{
    private readonly IQuizRepository _quizRepository;

    public QuizService(IQuizRepository quizRepository)
    {
        _quizRepository = quizRepository;
    }

    public async Task<QuizDto> CreateQuizAsync(CreateQuizDto dto, Guid userId, string username)
    {
        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            IsPublic = dto.IsPublic,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            Questions = dto.Questions.Select(q => new Question
            {
                Id = Guid.NewGuid(),
                Text = q.Text,
                QuestionType = q.QuestionType,
                Position = q.Position,
                Answers = q.Answers.Select(a => new Answer
                {
                    Id = Guid.NewGuid(),
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                }).ToList()
            }).ToList()
        };
        
        await _quizRepository.AddAsync(quiz);
        await _quizRepository.SaveChangesAsync();
        
        return MapToDto(quiz, username);
    }

    public async Task<QuizDto?> GetQuizAsync(Guid id)
    {
        var quiz = await _quizRepository.GetByIdAsync(id);
        if (quiz is null) return null;
        return MapToDto(quiz, quiz.User?.Username ?? "Unknown");
    }

    public async Task<IEnumerable<QuizDto>> GetPublicQuizzesAsync()
    {
        var quizzes = await _quizRepository.GetAllPublicAsync();
        return quizzes.Select(q => MapToDto(q , q.User?.Username ?? "Unknown"));
    }

    public async Task<IEnumerable<QuizDto>> GetMyQuizzesAsync(Guid userId)
    {
        var quizzes = await _quizRepository.GetByUserIdAsync(userId);
        return quizzes.Select(q => MapToDto(q, ""));
    }
    public async Task<(bool Success, string? Error)> DeleteQuizAsync(Guid quizId, Guid userId)
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz is null) return (false, "Quiz not found");
        if (quiz.UserId != userId) return (false, "Access denied");

        _quizRepository.Remove(quiz);
        await _quizRepository.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(QuizDto? Result, string? Error)> UpdateQuizAsync(
        Guid quizId, UpdateQuizDto dto, Guid userId)
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz is null) return (null, "Quiz not found");
        if (quiz.UserId != userId) return (null, "Access denied");

        if (string.IsNullOrWhiteSpace(dto.Title))
            return (null, "Title is required");
        if (!dto.Questions.Any())
            return (null, "At least one question is required");

        quiz.Title = dto.Title.Trim();
        quiz.Description = dto.Description.Trim();
        quiz.IsPublic = dto.IsPublic;

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

        var username = quiz.User?.Username ?? "";
        return (MapToDto(quiz, username), null);
    }
    private QuizDto MapToDto(Quiz quiz, string username) => new()
    {
        Id = quiz.Id,
        Title = quiz.Title,
        Description = quiz.Description,
        IsPublic = quiz.IsPublic,
        CreatedBy = username,
        CreatedAt = quiz.CreatedAt,
        Questions = quiz.Questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            QuestionType = q.QuestionType,
            Position = q.Position,
            Answers = q.Answers.Select(a => new AnswerDto
            {
                Id = a.Id,
                Text = a.Text,
                IsCorrect = a.IsCorrect,
            }).ToList()
        }).ToList()
    };
}