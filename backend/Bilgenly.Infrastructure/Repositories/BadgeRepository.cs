using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bilgenly.Infrastructure.Repositories;

public class BadgeRepository : IBadgeRepository
{
    private readonly AppDbContext _context;

    public BadgeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Badge>> GetAllAsync()
        => await _context.Badges.ToListAsync();

    public async Task<IEnumerable<UserBadge>> GetByUserIdAsync(Guid userId)
        => await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Include(ub => ub.Badge)
            .OrderByDescending(ub => ub.EarnedAt)
            .ToListAsync();

    public async Task AddUserBadgeAsync(UserBadge userBadge)
        => await _context.UserBadges.AddAsync(userBadge);

    public async Task<bool> UserHasBadgeAsync(Guid userId, Guid badgeId)
        => await _context.UserBadges
            .AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}