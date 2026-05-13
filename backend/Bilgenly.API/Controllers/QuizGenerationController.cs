using Bilgenly.Application.DTOs;
using Bilgenly.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bilgenly.API.Controllers;

[ApiController]
[Route("api/quiz-generation")]
[Authorize(Roles = "Teacher")]
public class QuizGenerationController : ControllerBase
{
    private readonly QuizGenerationService _generationService;

    public QuizGenerationController(QuizGenerationService generationService)
    {
        _generationService = generationService;
    }

    [HttpPost("from-text")]
    public async Task<IActionResult> GenerateFromText([FromBody] GenerateQuizConfigDto config)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var (result, error) = await _generationService.GenerateFromTextAsync(config, userId);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPost("from-pdf")]
    public async Task<IActionResult> GenerateFromPdf(
        IFormFile file,
        [FromForm] string title,
        [FromForm] string topic,
        [FromForm] string topicFocus,
        [FromForm] int questionCount = 5,
        [FromForm] string questionType = "MCQ",
        [FromForm] string additionalInstructions = "")
    {
        if (file.Length == 0)
            return BadRequest(new { message = "File is empty" });

        if (!file.FileName.EndsWith(".pdf"))
            return BadRequest(new { message = "Only PDF files allowed" });

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);

        var config = new GenerateQuizConfigDto
        {
            Title = title,
            Topic = topic,
            TopicFocus = topicFocus,
            QuestionCount = questionCount,
            QuestionType = questionType,
            AdditionalInstructions = additionalInstructions,
            SourceType = "pdf"
        };

        var (result, error) = await _generationService.GenerateFromPdfAsync(
            ms.ToArray(), config, userId);

        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPut("{quizId}/review")]
    public async Task<IActionResult> SaveAfterReview(
        Guid quizId, [FromBody] UpdateGeneratedQuizDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var (result, error) = await _generationService.UpdateAfterReviewAsync(quizId, dto, userId);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpGet("{quizId}/review")]
    public async Task<IActionResult> GetForReview(Guid quizId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(new { quizId, message = "Use GET /api/quizzes/{id}" });
    }
}