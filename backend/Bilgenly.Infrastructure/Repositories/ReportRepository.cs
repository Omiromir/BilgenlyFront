using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bilgenly.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly AppDbContext _context;

    public ReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Report>> GetAllAsync()
        => await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedQuiz)
            .Include(r => r.ReportedUser)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Report>> GetPendingAsync()
        => await _context.Reports
            .Where(r => r.Status == "pending")
            .Include(r => r.Reporter)
            .Include(r => r.ReportedQuiz)
            .Include(r => r.ReportedUser)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<Report?> GetByIdAsync(Guid id)
        => await _context.Reports
            .Include(r => r.Reporter)
            .Include(r => r.ReportedQuiz)
            .Include(r => r.ReportedUser)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task AddAsync(Report report)
        => await _context.Reports.AddAsync(report);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
