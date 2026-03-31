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
    }
    
}