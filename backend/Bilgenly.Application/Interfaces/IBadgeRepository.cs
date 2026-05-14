using Bilgenly.Domain.Entities;
namespace Bilgenly.Application.Interfaces;

public interface IBadgeRepository
{
    Task<IEnumerable<Badge>> GetAllAsync();
    Task<IEnumerable<UserBadge>> GetByUserIdAsync(Guid userId);
    Task AddUserBadgeAsync(UserBadge userBadge);
    Task<bool> UserHasBadgeAsync(Guid userId, Guid badgeId);
    Task SaveChangesAsync();
}