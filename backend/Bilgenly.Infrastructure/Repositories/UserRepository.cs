using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
namespace Bilgenly.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task <User?> GetByEmailAsync(string email)
        => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    public async Task <bool> ExistsByEmailAsync(string email)
        => await _context.Users.AnyAsync(u => u.Email == email);
    public async Task AddAsync(User user)
        => await _context.Users.AddAsync(user);
    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}