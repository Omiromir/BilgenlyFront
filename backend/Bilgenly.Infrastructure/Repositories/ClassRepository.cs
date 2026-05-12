using Bilgenly.Application.Interfaces;
using Bilgenly.Domain.Entities;
using Bilgenly.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bilgenly.Infrastructure.Repositories;

public class ClassRepository : IClassRepository
{
    private readonly AppDbContext _context;

    public ClassRepository(AppDbContext context)
    {
        _context = context;
    }

    public void Remove(Class classEntity)
        => _context.Classes.Remove(classEntity);

    public async Task<Class?> GetByIdAsync(Guid id)
        => await _context.Classes
            .Include(c => c.Teacher)
            .Include(c => c.ClassStudents)
            .ThenInclude(cs => cs.Student)
            .Include(c => c.Assignments) 
            .ThenInclude(a => a.Quiz)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Class?> GetByInviteCodeAsync(string inviteCode)
        => await _context.Classes
            .Include(c => c.ClassStudents)
            .FirstOrDefaultAsync(c => c.InviteCode == inviteCode);

    public async Task<IEnumerable<Class>> GetByTeacherIdAsync(Guid teacherId)
        => await _context.Classes
            .Where(c => c.TeacherId == teacherId)
            .Include(c => c.ClassStudents)
            .Include(c => c.Assignments) 
            .ThenInclude(a => a.Quiz)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Class>> GetByStudentIdAsync(Guid studentId)
        => await _context.Classes
            .Where(c => c.ClassStudents.Any(cs => cs.StudentId == studentId))
            .Include(c => c.Teacher)
            .Include(c => c.Assignments) 
            .ThenInclude(a => a.Quiz)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

    public async Task<Assignment?> GetAssignmentByIdAsync(Guid assignmentId)
        => await _context.Assignments
            .Include(a => a.Quiz)
            .ThenInclude(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .Include(a => a.Class)
            .ThenInclude(c => c.ClassStudents)
            .ThenInclude(cs => cs.Student)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

    public async Task<IEnumerable<Assignment>> GetAssignmentsByClassIdAsync(Guid classId)
        => await _context.Assignments
            .Where(a => a.ClassId == classId)
            .Include(a => a.Quiz)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

    public async Task AddAsync(Class classEntity)
        => await _context.Classes.AddAsync(classEntity);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}