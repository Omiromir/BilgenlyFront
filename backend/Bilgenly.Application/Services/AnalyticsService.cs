using Bilgenly.Application.DTOs;
using Bilgenly.Application.Interfaces;

namespace Bilgenly.Application.Services;

public class AnalyticsService
{
    private readonly IAttemptRepository _attemptRepository;
    private readonly IQuizRepository _quizRepository;
    private readonly IClassRepository _classRepository; 

    public AnalyticsService(
        IAttemptRepository attemptRepository,
        IQuizRepository quizRepository,
        IClassRepository classRepository) 
    {
        _attemptRepository = attemptRepository;
        _quizRepository = quizRepository;
        _classRepository = classRepository; 
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
    public async Task<(ClassAnalyticsDto? Result, string? Error)> GetClassAnalyticsAsync(
    Guid assignmentId, Guid teacherId)
{
    var assignment = await _classRepository.GetAssignmentByIdAsync(assignmentId);
    if (assignment is null) return (null, "Assignment not found");
    if (assignment.Class.TeacherId != teacherId) return (null, "Access denied");

    var quiz = assignment.Quiz;
    var students = assignment.Class.ClassStudents
        .Where(cs => cs.Student != null).ToList();

    // Берём попытки всех студентов по этому квизу
    var allAttempts = (await _attemptRepository.GetByQuizIdAsync(quiz.Id)).ToList();

    var studentResults = students.Select(cs =>
    {
        var student = cs.Student!;
        var studentAttempts = allAttempts
            .Where(a => a.UserId == cs.StudentId && a.IsCompleted)
            .OrderByDescending(a => a.DateTaken)
            .ToList();

        var attemptsUsed = studentAttempts.Count;
        var latestScore = studentAttempts.FirstOrDefault()?.Score;
        var bestScore = studentAttempts.Any()
            ? studentAttempts.Max(a => a.Score) : (int?)null;

        var deadlinePassed = assignment.Deadline.HasValue
            && DateTime.UtcNow > assignment.Deadline.Value
            && !assignment.AllowLateSubmissions;

        var exhausted = assignment.MaxAttempts.HasValue
            && attemptsUsed >= assignment.MaxAttempts.Value;

        var status = exhausted ? "attempts_exhausted"
            : attemptsUsed > 0 ? "completed"
            : deadlinePassed ? "expired"
            : "active";

        return new StudentAssignmentResultDto
        {
            StudentId = cs.StudentId,
            StudentName = student.Username,
            Email = student.Email,
            Status = status,
            AttemptsUsed = attemptsUsed,
            AttemptsRemaining = assignment.MaxAttempts.HasValue
                ? Math.Max(assignment.MaxAttempts.Value - attemptsUsed, 0)
                : null,
            LatestScore = latestScore,
            BestScore = bestScore,
            LastAttemptAt = studentAttempts.FirstOrDefault()?.DateTaken,
            MissedDeadline = deadlinePassed && attemptsUsed == 0
        };
    }).ToList();

    var completed = studentResults.Count(s => s.Status == "completed");
    var missed = studentResults.Count(s => s.MissedDeadline);
    var needsAttention = studentResults.Count(s =>
        s.BestScore.HasValue && s.BestScore < 70);

    // Статистика по вопросам
    var attemptsWithAnswers = allAttempts
        .Where(a => a.AttemptAnswers.Any()).ToList();

    var questionStats = quiz.Questions.Select(q =>
    {
        int totalAnswered = attemptsWithAnswers.Count(a =>
            a.AttemptAnswers.Any(aa => aa.QuestionId == q.Id));
        int correctCount = attemptsWithAnswers.Count(a =>
            a.AttemptAnswers.Any(aa => aa.QuestionId == q.Id && aa.IsCorrect));

        return new QuestionAnalyticsDto
        {
            QuestionId = q.Id,
            QuestionText = q.Text,
            TotalAnswered = totalAnswered,
            CorrectAnswers = correctCount,
            CorrectPercentage = totalAnswered > 0
                ? Math.Round((double)correctCount / totalAnswered * 100, 1) : 0
        };
    }).ToList();

    return (new ClassAnalyticsDto
    {
        ClassId = assignment.ClassId,
        ClassName = assignment.Class.Name,
        AssignmentId = assignment.Id,
        QuizTitle = quiz.Title,
        QuestionCount = quiz.Questions.Count,
        TotalStudents = students.Count,
        CompletedCount = completed,
        InProgressCount = 0,
        MissedDeadlineCount = missed,
        NeedsAttentionCount = needsAttention,
        CompletionRate = students.Count > 0
            ? Math.Round((double)completed / students.Count * 100, 1) : 0,
        AverageScore = allAttempts.Any()
            ? Math.Round(allAttempts.Average(a => a.Score), 1) : null,
        AvgAttemptsUsed = students.Count > 0
            ? (int)Math.Round(studentResults.Average(s => s.AttemptsUsed)) : 0,
        Deadline = assignment.Deadline,
        MaxAttempts = assignment.MaxAttempts,
        StudentResults = studentResults,
        QuestionStats = questionStats
    }, null);
}
    
}