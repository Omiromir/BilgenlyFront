using Bilgenly.Application.DTOs;
using Bilgenly.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bilgenly.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly QuizService _quizService;

    public QuizController(QuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> CreateQuiz(CreateQuizDto dto)
    {
        var userId = Guid .Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var username = User.FindFirst(ClaimTypes.Name)!.Value;

        var quiz = await _quizService.CreateQuizAsync(dto, userId, username);
        return Ok(quiz);
    }

    [HttpGet("My")]
    [Authorize]
    public async Task<IActionResult> GetMyQuizzes()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var quizzes = await _quizService.GetMyQuizzesAsync(userId);
        return Ok(quizzes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var quiz = await _quizService.GetQuizAsync(id);
        if (quiz is null) return NotFound(new { message = "Quiz not found" });
        return Ok(quiz);
    }
}