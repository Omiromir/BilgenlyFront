using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByRecipientAsync(Guid userId, string email);
    Task<Notification?> GetByIdAsync(Guid id);
    Task<Notification?> GetClassInvitationAsync(string relatedClassId, string studentId);
    Task AddAsync(Notification notification);
    Task SaveChangesAsync();
    void Remove(Notification notification);
}
