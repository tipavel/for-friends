using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseSqlServer(
            "Server=ANAN;Database=ForFriendsDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true");

        return new AppDbContext(optionsBuilder.Options);
    }
}