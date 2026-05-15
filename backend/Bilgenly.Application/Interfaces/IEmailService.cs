namespace Bilgenly.Application.Interfaces;

public interface IEmailService
{
    Task SendClassInvitationAsync(
        string recipientEmail,
        string teacherName,
        string className,
        string inviteCode,
        string frontendBaseUrl);
}
