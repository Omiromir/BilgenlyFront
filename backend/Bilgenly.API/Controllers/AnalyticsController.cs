using Bilgenly.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace Bilgenly.API.Controllers;

[ApiController]
[Route("api/Analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;

    public AnalyticsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("quiz/{quizId}")]
    [Authorize(Roles = "Teacher, Moderator")]
    public async Task<IActionResult> GetQuizAnalytics(Guid quizId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var (result, error) = await _analyticsService.GetQuizAnalyticsAsync(quizId, userId);
        if (result == null)
            return BadRequest(new { message = error });
        
        return Ok(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyAnalytics()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var username = User.FindFirst(ClaimTypes.Name)!.Value;

        var result = await _analyticsService.GetStudentAnalyticsAsync(userId, username);
        return Ok(result);
    }

    [HttpGet("quiz/{quizId}/student/{studentId}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetStudentAnalytics(Guid quizId, Guid studentId)
    {
        var teacherId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var (result, error) = await _analyticsService
            .GetStudentAnalyticsForTeacherAsync(studentId, quizId, teacherId);
        if (result == null)
            return BadRequest(new { message = error });
        
        return Ok(result);
    } 
}