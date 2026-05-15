using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bilgenly.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetByRecipientAsync(Guid userId, string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        return await _context.Notifications
            .Where(n =>
                n.RecipientUserId == userId ||
                n.RecipientEmail.ToLower() == normalizedEmail)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
        => await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);

    public async Task<Notification?> GetClassInvitationAsync(string relatedClassId, string studentId)
        => await _context.Notifications.FirstOrDefaultAsync(n =>
            n.Type == "class_invitation" &&
            n.RelatedClassId == relatedClassId &&
            n.StudentId == studentId);

    public async Task AddAsync(Notification notification)
        => await _context.Notifications.AddAsync(notification);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();

    public void Remove(Notification notification)
        => _context.Notifications.Remove(notification);
}
