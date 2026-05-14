using Bilgenly.Application.DTOs;
using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Services;

public class AttemptService
{
    private readonly IAttemptRepository _attemptRepository;
    private readonly IQuizRepository _quizRepository;

    public AttemptService(IAttemptRepository attemptRepository, IQuizRepository quizRepository)
    {
        _attemptRepository = attemptRepository;
        _quizRepository = quizRepository;
    }
    public async Task<IEnumerable<MyAttemptDto>> GetMyAttemptsAsync(Guid userId)
    {
        var attempts = await _attemptRepository.GetByUserIdAsync(userId);
        return attempts
            .OrderByDescending(a => a.DateTaken)
            .Select(a =>
        {
            var questionResults = a.IsCompleted
                ? a.Quiz.Questions
                    .OrderBy(q => q.Position)
                    .Select(question =>
                    {
                        var selectedAttemptAnswer = a.AttemptAnswers.FirstOrDefault(
                            attemptAnswer => attemptAnswer.QuestionId == question.Id);
                        var selectedAnswer = selectedAttemptAnswer is null
                            ? null
                            : question.Answers.FirstOrDefault(answer => answer.Id == selectedAttemptAnswer.AnswerId);
                        var correctAnswer = question.Answers.FirstOrDefault(answer => answer.IsCorrect);

                        return new MyAttemptQuestionReviewDto
                        {
                            QuestionId = question.Id,
                            QuestionText = question.Text,
                            QuestionType = question.QuestionType,
                            Position = question.Position,
                            Explanation = question.Explanation,
                            SelectedAnswerId = selectedAnswer?.Id,
                            SelectedAnswerText = selectedAnswer?.Text,
                            CorrectAnswerId = correctAnswer?.Id,
                            CorrectAnswerText = correctAnswer?.Text,
                            IsCorrect = selectedAttemptAnswer?.IsCorrect ?? false,
                            AnswerOptions = question.Answers
                                .Select(answer => new MyAttemptAnswerOptionDto
                                {
                                    Id = answer.Id,
                                    Text = answer.Text,
                                    IsCorrect = answer.IsCorrect,
                                })
                                .ToList(),
                        };
                    })
                    .ToList()
                : new List<MyAttemptQuestionReviewDto>();

            return new MyAttemptDto
            {
                Id = a.Id,
                QuizId = a.QuizId,
                QuizTitle = a.Quiz.Title,
                Score = a.Score,
                DateTaken = a.DateTaken,
                IsCompleted = a.IsCompleted,
                TotalQuestions = a.Quiz.Questions.Count,
                CorrectAnswers = a.AttemptAnswers.Count(attemptAnswer => attemptAnswer.IsCorrect),
                Questions = questionResults,
            };
        });
    }
    public async Task<(StartAttemptDto? Result, string? Error)> StartAttemptAsync(Guid quizId, Guid userId)
    {
        var quiz = await _quizRepository.GetByIdAsync(quizId);
        if (quiz is null)
            return (null, "Quiz not found");

        var attempt = new Attempt
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            QuizId = quizId,
            Score = 0,
            DateTaken = DateTime.UtcNow,
            IsCompleted = false
        };

        await _attemptRepository.AddAsync(attempt);
        await _attemptRepository.SaveChangesAsync();

        return (new StartAttemptDto
        {
            AttemptId = attempt.Id,
            QuizId = quiz.Id,
            QuizTitle = quiz.Title,
            Questions = quiz.Questions.Select(q => new QuestionForStudentDto
            {
                Id = q.Id,
                Text = q.Text,
                QuestionType = q.QuestionType,
                Position = q.Position,
                Answers = q.Answers.Select(a => new AnswerForStudentDto
                {
                    Id = a.Id,
                    Text = a.Text
                   
                }).ToList()
            }).OrderBy(q => q.Position).ToList()
        }, null);
    }
    public async Task<IEnumerable<object>> GetAttemptsByQuizAsync(Guid quizId, Guid userId)
    {
        var attempts = (await _attemptRepository.GetByUserIdAsync(userId))
            .Where(a => a.QuizId == quizId)
            .OrderByDescending(a => a.DateTaken)
            .Select(a => new
            {
                attemptId = a.Id,
                quizId = a.QuizId,
                score = a.Score,
                isCompleted = a.IsCompleted,
                dateTaken = a.DateTaken
            });
        return attempts;
    }
    public async Task<(AttemptResultDto? Result, string? Error)> SubmitAttemptAsync(
        Guid attemptId, Guid userId, SubmitAttemptDto dto)
    {
        var attempt = await _attemptRepository.GetByIdAsync(attemptId);
        if (attempt is null)
            return (null, "Attempt not found");

        if (attempt.UserId != userId)
            return (null, "This is not your attempt");

        if (attempt.IsCompleted)
            return (null, "Attempt already completed");

        var quiz = attempt.Quiz;
        var questionResults = new List<QuestionResultDto>();
        var attemptAnswers = new List<AttemptAnswer>();
        int correctCount = 0;

        foreach (var question in quiz.Questions)
        {
            
            var studentAnswer = dto.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
            var selectedAnswer = question.Answers.FirstOrDefault(a => a.Id == studentAnswer?.AnswerId);

            bool isCorrect = selectedAnswer?.IsCorrect ?? false;
            if (isCorrect) correctCount++;

            if (studentAnswer != null)
            {
                attemptAnswers.Add(new AttemptAnswer
                {
                  Id = Guid.NewGuid(),
                  AttemptId = attempt.Id,
                  QuestionId = question.Id,
                  AnswerId = studentAnswer.AnswerId,
                  IsCorrect = isCorrect,
                });
            }
            questionResults.Add(new QuestionResultDto
            {
                QuestionId = question.Id,
                QuestionText = question.Text,
                SelectedAnswer = selectedAnswer?.Text ?? "Не отвечено",
                CorrectAnswer = correctAnswer?.Text ?? "",
                IsCorrect = isCorrect
            });
        }

        int totalQuestions = quiz.Questions.Count;
        int score = totalQuestions > 0
            ? (int)Math.Round((double)correctCount / totalQuestions * 100)
            : 0;

        attempt.Score = score;
        attempt.IsCompleted = true;
        await _attemptRepository.AddAnswersAsync(attemptAnswers);
        await _attemptRepository.SaveChangesAsync();

        return (new AttemptResultDto
        {
            AttemptId = attempt.Id,
            QuizTitle = quiz.Title,
            Score = score,
            TotalQuestions = totalQuestions,
            CorrectAnswers = correctCount,
            Questions = questionResults
        }, null);
    }
}
