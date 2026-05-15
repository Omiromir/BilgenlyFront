using Bilgenly.Application.DTOs;
using Bilgenly.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bilgenly.API.Controllers;

[ApiController]
[Route("api/preferences")]
[Authorize]
public class PreferencesController : ControllerBase
{
    private readonly UserPreferencesService _preferencesService;

    public PreferencesController(UserPreferencesService preferencesService)
    {
        _preferencesService = preferencesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPreferences()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _preferencesService.GetAsync(userId);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> SaveMyPreferences([FromBody] SaveUserPreferencesDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _preferencesService.SaveAsync(userId, dto);
        return Ok(result);
    }
}
