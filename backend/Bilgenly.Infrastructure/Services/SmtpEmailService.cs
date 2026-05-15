using Bilgenly.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Bilgenly.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendClassInvitationAsync(
        string recipientEmail,
        string teacherName,
        string className,
        string inviteCode,
        string frontendBaseUrl)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = int.TryParse(_configuration["Email:SmtpPort"], out var port) ? port : 587;
        var smtpUser = _configuration["Email:SmtpUser"];
        var smtpPass = _configuration["Email:SmtpPass"];
        var fromAddress = _configuration["Email:FromAddress"] ?? smtpUser ?? "noreply@bilgenly.com";

        if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpUser))
            return;

        var joinLink = $"{frontendBaseUrl.TrimEnd('/')}/join?code={inviteCode}";

        var body = $@"
<p>Hello,</p>
<p><strong>{HtmlEncode(teacherName)}</strong> has invited you to join the class <strong>{HtmlEncode(className)}</strong> on Bilgenly.</p>
<p>Use invite code: <strong>{HtmlEncode(inviteCode)}</strong></p>
<p>Or click the link below to join directly:</p>
<p><a href=""{joinLink}"">{joinLink}</a></p>
<p>If you don't have an account yet, sign up at {HtmlEncode(frontendBaseUrl)} and use the invite code when joining.</p>
<br/>
<p>— The Bilgenly Team</p>
";

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPass),
            EnableSsl = true,
        };

        using var message = new MailMessage(fromAddress, recipientEmail)
        {
            Subject = $"You've been invited to join \"{className}\" on Bilgenly",
            Body = body,
            IsBodyHtml = true,
        };

        await client.SendMailAsync(message);
    }

    private static string HtmlEncode(string? value)
        => System.Net.WebUtility.HtmlEncode(value ?? string.Empty);
}
