using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<StaffAccount> StaffAccounts => Set<StaffAccount>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.NameAr).HasMaxLength(100);
            entity.Property(x => x.Cat).IsRequired().HasMaxLength(40);
            entity.Property(x => x.Price).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Emoji).HasMaxLength(20);
            entity.Property(x => x.Desc).HasMaxLength(300);
            entity.Property(x => x.DescAr).HasMaxLength(300);
            entity.Property(x => x.ImageUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasMaxLength(20);
            entity.Property(x => x.Name).HasMaxLength(100);
            entity.Property(x => x.Phone).HasMaxLength(50);
            entity.Property(x => x.Notes).HasMaxLength(500);
            entity.Property(x => x.Pickup).HasMaxLength(50);
            entity.Property(x => x.Status).HasMaxLength(20);
            entity.Property(x => x.PaymentMethod).HasMaxLength(20);
            entity.Property(x => x.PaymentStatus).HasMaxLength(20);
            entity.Property(x => x.PaymentId).HasMaxLength(100);
            entity.Property(x => x.PaymentMessage).HasMaxLength(500);
            entity.Property(x => x.PromoCode).HasMaxLength(50);
            entity.Property(x => x.Subtotal).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Discount).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Tax).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Total).HasColumnType("decimal(10,2)");
            entity.HasMany(x => x.Items).WithOne(x => x.Order!).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Price).HasColumnType("decimal(10,2)");
            entity.Property(x => x.Emoji).HasMaxLength(20);
        });

        modelBuilder.Entity<PromoCode>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).IsRequired().HasMaxLength(50);
            entity.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)");
            entity.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<Offer>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).IsRequired().HasMaxLength(100);
            entity.Property(x => x.TitleAr).HasMaxLength(100);
            entity.Property(x => x.Subtitle).HasMaxLength(200);
            entity.Property(x => x.SubtitleAr).HasMaxLength(200);
            entity.Property(x => x.BgColor).HasMaxLength(20);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Key).IsRequired().HasMaxLength(40);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.NameAr).HasMaxLength(100);
            entity.HasIndex(x => x.Key).IsUnique();
        });

        modelBuilder.Entity<AppSetting>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TaxPercent).HasColumnType("decimal(5,2)");
            entity.Property(x => x.EditableFooterEn).HasMaxLength(300);
            entity.Property(x => x.EditableFooterAr).HasMaxLength(300);
            entity.Property(x => x.PickupLocation).HasMaxLength(300);
            entity.Property(x => x.PickupPhone).HasMaxLength(100);
        });

        modelBuilder.Entity<StaffAccount>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Username).IsRequired().HasMaxLength(50);
            entity.Property(x => x.Password).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Role).IsRequired().HasMaxLength(30);
            entity.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<CustomerProfile>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(100);
            entity.Property(x => x.Phone).HasMaxLength(50);
            entity.Property(x => x.LastNotes).HasMaxLength(500);
            entity.Property(x => x.LastPickup).HasMaxLength(50);
            entity.HasIndex(x => x.Phone);
        });
    }
}
