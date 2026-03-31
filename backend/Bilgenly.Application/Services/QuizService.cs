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