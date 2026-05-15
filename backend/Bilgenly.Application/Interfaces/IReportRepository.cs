using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Interfaces;

public interface IReportRepository
{
    Task<IEnumerable<Report>> GetAllAsync();
    Task<IEnumerable<Report>> GetPendingAsync();
    Task<Report?> GetByIdAsync(Guid id);
    Task AddAsync(Report report);
    Task SaveChangesAsync();
}
