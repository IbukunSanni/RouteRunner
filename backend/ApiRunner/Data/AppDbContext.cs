using Microsoft.EntityFrameworkCore;
using ApiRunner.Models;

namespace ApiRunner.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Integration> Integrations { get; set; }
        public DbSet<ApiRequest> ApiRequests { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Integration>()
                .HasMany(i => i.Requests)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
