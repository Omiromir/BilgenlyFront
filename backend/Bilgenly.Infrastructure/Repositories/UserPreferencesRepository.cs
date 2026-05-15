using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bilgenly.Infrastructure.Repositories;

public class UserPreferencesRepository : IUserPreferencesRepository
{
    private readonly AppDbContext _context;

    public UserPreferencesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserPreferences?> GetByUserIdAsync(Guid userId)
        => await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId);

    public async Task AddAsync(UserPreferences preferences)
        => await _context.UserPreferences.AddAsync(preferences);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
