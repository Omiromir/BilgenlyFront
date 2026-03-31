using Bilgenly.Domain.Entities;
namespace Bilgenly.Application.Interfaces;

public interface IQuizRepository
{
    Task<Quiz?> GetByIdAsync(Guid id);
    Task<IEnumerable<Quiz>> GetAllPublicAsync();
    Task<IEnumerable<Quiz>> GetByUserIdAsync(Guid userId);
    Task AddAsync(Quiz quiz);
    Task SaveChangesAsync();
}