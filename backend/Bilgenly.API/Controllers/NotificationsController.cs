using Bilgenly.Application.DTOs;
using Bilgenly.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bilgenly.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var results = await _notificationService.GetForUserAsync(userId, email);
        return Ok(results);
    }

    [HttpPost("class-invitation")]
    public async Task<IActionResult> UpsertClassInvitation([FromBody] CreateNotificationDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var (result, error) = await _notificationService.UpsertClassInvitationAsync(dto, userId);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPost("quiz-follow-up")]
    public async Task<IActionResult> CreateQuizFollowUp([FromBody] CreateNotificationDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var (result, error) = await _notificationService.CreateQuizFollowUpAsync(dto, userId);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var (result, error) = await _notificationService.MarkReadAsync(id, userId, email);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        await _notificationService.MarkAllReadAsync(userId, email);
        return Ok();
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateNotificationStatusDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var (result, error) = await _notificationService.UpdateStatusAsync(id, dto.Status, userId, email);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var error = await _notificationService.DeleteAsync(id, userId, email);
        if (error is not null) return BadRequest(new { message = error });
        return NoContent();
    }

    [HttpDelete("class/{relatedClassId}")]
    public async Task<IActionResult> DeleteForClass(string relatedClassId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _notificationService.DeleteForClassAsync(relatedClassId, userId);
        return NoContent();
    }
}
