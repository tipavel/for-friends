namespace backend.Models;

public class PromoCode
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public decimal DiscountPercent { get; set; }   // e.g. 15 = 15%
    public bool Active { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
    public int MaxUses { get; set; } = 0;          // 0 = unlimited
    public int UseCount { get; set; } = 0;
}
