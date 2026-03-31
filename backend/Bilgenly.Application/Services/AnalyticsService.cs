using Bilgenly.Application.DTOs;
using Bilgenly.Application.Interfaces;

namespace Bilgenly.Application.Services;

public class AnalyticsService
{
    private readonly IAttemptRepository _attemptRepository;
    private readonly IQuizRepository _quizRepository;

    public AnalyticsService(
        IAttemptRepository attemptRepository,
        IQuizRepository quizRepository)
    {
        _attemptRepository = attemptRepository;
        _quizRepository = quizRepository;
    }

    public async Task<(QuizAnalyticsDto? Result, string? Error)> GetQuizAnalyticsAsync(Guid quizId,
        Guid requestingUserId)
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz == null)
            return (null , "Quiz not found");
        
        if (quiz.UserId != requestingUserId)
            return (null, "Access denied");
        
        var attempts = (await  _attemptRepository.GetByQuizIdAsync(quizId)).ToList();
        
        if (!attempts.Any())
        {
            return (new QuizAnalyticsDto
            {
                QuizId = quiz.Id,
                QuizTitle = quiz.Title,
                TotalAttempts = 0,
                AverageScore = 0,
                HighestScore = 0,
                LowestScore = 0,
                Questions = new()
            }, null);
        }

        var questionStats = quiz.Questions.Select(q =>
        {
            int totalAnswered = attempts.Count(a =>
                a.AttemptAnswers.Any(aa => aa.QuestionId == q.Id));

            int correctCount = attempts.Count(a =>
                a.AttemptAnswers.Any(aa => aa.QuestionId == q.Id && aa.IsCorrect));

            double correctPct = totalAnswered > 0
                ? Math.Round((double)correctCount / totalAnswered * 100, 1)
                : 0;

            return new QuestionAnalyticsDto
            {
                QuestionId = q.Id,
                QuestionText = q.Text,
                TotalAnswered = totalAnswered,
                CorrectAnswers = correctCount,
                CorrectPercentage = correctPct
            };
        }).ToList();
        return (new QuizAnalyticsDto
        {
            QuizId = quiz.Id,
            QuizTitle = quiz.Title,
            TotalAttempts = attempts.Count,
            AverageScore = Math.Round(attempts.Average(a => a.Score), 1),
            HighestScore = attempts.Max(a => a.Score),
            LowestScore = attempts.Min(a => a.Score),
            Questions = questionStats
        }, null);
    }

    public async Task<StudentAnalyticsDto> GetStudentAnalyticsAsync(Guid userId, string username)
    {
        var attempts = (await _attemptRepository.GetByUserIdAsync(userId))
            .Where(a => a.IsCompleted)
            .ToList();
        var attemptSummaries = attempts.Select(a => new AttemptSummaryDto
        {
            AttemptId = a.Id,
            QuizId = a.QuizId,
            QuizTitle = a.Quiz?.Title ?? "Unknown",
            Score = a.Score,
            DateTaken = a.DateTaken,
            IsCompleted = a.IsCompleted,
        }).ToList();
        return new StudentAnalyticsDto
        {
            UserId = userId,
            Username = username,
            TotalAttempts = attempts.Count,
            AverageScore = attempts.Any()
                ? Math.Round(attempts.Average(a => a.Score), 1)
                : 0,
            Attempts = attemptSummaries,
        };
    }

    public async Task<(StudentAnalyticsDto? Result, string? Error)> GetStudentAnalyticsForTeacherAsync(Guid studentId, Guid quizId, Guid teacherId )
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz == null)
            return (null, "Quiz not found");
        if (quiz.UserId != teacherId)
            return (null, "Access denied");
        var attempts = (await _attemptRepository.GetByUserIdAsync(studentId))
            .Where(a => a.QuizId == quizId && a.IsCompleted)
            .ToList();
        var summaries = attempts.Select(a => new AttemptSummaryDto
        {
            AttemptId = a.Id,
            QuizId = a.QuizId,
            QuizTitle = a.Quiz?.Title ?? "Unknown",
            Score = a.Score,
            DateTaken = a.DateTaken,
            IsCompleted = a.IsCompleted
        }).ToList();
        return (new StudentAnalyticsDto
        {
            UserId = studentId,
            Username = attempts.FirstOrDefault()?.User?.Username ?? "Unknown",
            TotalAttempts = attempts.Count,
            AverageScore = attempts.Any()
                ? Math.Round(attempts.Average(a => a.Score), 1)
                : 0,
            Attempts = summaries
        }, null);
    }
    
}