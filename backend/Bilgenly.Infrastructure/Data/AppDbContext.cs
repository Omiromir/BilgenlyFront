namespace Bilgenly.Infrastructure.Data;
using Bilgenly.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Attempt> Attempts => Set<Attempt>();
    public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
        });
        modelBuilder.Entity<Quiz>(e =>
        {
            e.HasKey(q => q.Id);
            e.HasOne(q => q.User)
                .WithMany(u => u.Quizzes)
                .HasForeignKey(q => q.UserId);
        });
        modelBuilder.Entity<Attempt>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasOne(a => a.User)
                .WithMany(u => u.Attempts)
                .HasForeignKey(a => a.UserId);
            
            e.HasMany(a => a.AttemptAnswers)
                .WithOne(aa => aa.Attempt)
                .HasForeignKey(aa => aa.AttemptId);
        });
        modelBuilder.Entity<ClassStudent>(e =>
        {
            e.HasKey(cs => new { cs.ClassId, cs.StudentId }); 
            e.HasOne(cs => cs.Class)
                .WithMany(c => c.ClassStudents)
                .HasForeignKey(cs => cs.ClassId);
            e.HasOne(cs => cs.Student)
                .WithMany()
                .HasForeignKey(cs => cs.StudentId);
        });

        modelBuilder.Entity<Assignment>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasOne(a => a.Class)
                .WithMany(c => c.Assignments)
                .HasForeignKey(a => a.ClassId);
            e.HasOne(a => a.Quiz)
                .WithMany()
                .HasForeignKey(a => a.QuizId);
        });

        modelBuilder.Entity<Class>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.InviteCode).IsUnique();
            e.HasOne(c => c.Teacher)
                .WithMany()
                .HasForeignKey(c => c.TeacherId);
        });
        modelBuilder.Entity<UserBadge>(e =>
        {
            e.HasKey(ub => new { ub.UserId, ub.BadgeId });
            e.HasOne(ub => ub.User)
                .WithMany()
                .HasForeignKey(ub => ub.UserId);
            e.HasOne(ub => ub.Badge)
                .WithMany()
                .HasForeignKey(ub => ub.BadgeId);
        });
    }
    
}