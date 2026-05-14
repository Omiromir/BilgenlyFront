using Bilgenly.Domain.Entities;

namespace Bilgenly.Application.Interfaces;

public interface IClassRepository
{
    Task<Class?> GetByIdAsync(Guid id);
    Task<Class?> GetByInviteCodeAsync(string inviteCode);
    Task<IEnumerable<Class>> GetByTeacherIdAsync(Guid teacherId);
    Task<IEnumerable<Class>> GetByStudentIdAsync(Guid studentId);
    Task<Assignment?> GetAssignmentByIdAsync(Guid assignmentId);
    Task<IEnumerable<Assignment>> GetAssignmentsByClassIdAsync(Guid classId);
    Task AddAsync(Class classEntity);
    Task AddAssignmentAsync(Assignment assignment);
    Task SaveChangesAsync();
    void Remove(Class classEntity);
    void RemoveAssignment(Assignment assignment);
}
