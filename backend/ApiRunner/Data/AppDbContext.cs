using Microsoft.EntityFrameworkCore;
using ApiRunner.Models;

namespace ApiRunner.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Integration> Integrations { get; set; }
        public DbSet<ApiRequest> Requests { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

      
    }
}
