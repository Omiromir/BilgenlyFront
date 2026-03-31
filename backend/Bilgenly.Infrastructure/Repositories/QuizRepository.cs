using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bilgenly.Infrastructure.Repositories;

public class QuizRepository : IQuizRepository
{
    private readonly AppDbContext _context;

    public QuizRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Quiz?> GetByIdAsync(Guid id) 
        => await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .Include(q => q.User)
            .FirstOrDefaultAsync(q => q.Id == id);

    public async Task<IEnumerable<Quiz>> GetAllPublicAsync()
        => await _context.Quizzes
            .Where(q => q.IsPublic)
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .Include(q => q.User)
            .ToListAsync();
    
    public async Task<IEnumerable<Quiz>> GetByUserIdAsync(Guid userId)
        => await _context.Quizzes
            .Where(q => q.UserId == userId)
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .ToListAsync();
    
    public async Task AddAsync(Quiz quiz)
        => await _context.Quizzes.AddAsync(quiz);
    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}