using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Interfaces;

public interface IUserPreferencesRepository
{
    Task<UserPreferences?> GetByUserIdAsync(Guid userId);
    Task AddAsync(UserPreferences preferences);
    Task SaveChangesAsync();
}
