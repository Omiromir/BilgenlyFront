using Bilgenly.Application.DTOs;
using Bilgenly.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bilgenly.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController  : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var (result, error) = await _authService.RegisterAsync(dto);
        if (result is null)
            return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var(result, error ) = await _authService.LoginAsync(dto);
        if (result is null)
            return Unauthorized(new { message = error });
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var role  = User.FindFirst(ClaimTypes.Role)?.Value;

        return Ok(new { userId, email, username, role });
    }
    
}