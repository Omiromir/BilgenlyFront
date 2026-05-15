using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Interfaces;

public interface IClassInvitationRepository
{
    Task<ClassInvitation?> GetPendingAsync(Guid classId, string email);
    Task<IEnumerable<ClassInvitation>> GetByClassIdAsync(Guid classId);
    Task AddAsync(ClassInvitation invitation);
    Task SaveChangesAsync();
}
