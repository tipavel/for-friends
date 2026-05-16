namespace backend.Models;

public class AppSetting
{
    public int Id { get; set; }
    public decimal TaxPercent { get; set; } = 15;
    public string EditableFooterEn { get; set; } = "© 2026 For Friends Café. All rights reserved.";
    public string EditableFooterAr { get; set; } = "© 2026 فور فريندز كافيه. جميع الحقوق محفوظة.";
    public string PickupLocation { get; set; } = "";
    public string PickupPhone { get; set; } = "";
    // Social & contact
    public string Instagram { get; set; } = "";
    public string Facebook { get; set; } = "";
    public string Twitter { get; set; } = "";
    public string Snapchat { get; set; } = "";
    public string Whatsapp { get; set; } = "";
    public string Address { get; set; } = "";
    public string Email { get; set; } = "";
    // Drink size price multipliers (S / M / L)
    public decimal SizeSmMult { get; set; } = 1.0m;
    public decimal SizeMdMult { get; set; } = 1.25m;
    public decimal SizeLgMult { get; set; } = 1.5m;
    public string SizeSmLabel { get; set; } = "8 oz";
    public string SizeMdLabel { get; set; } = "12 oz";
    public string SizeLgLabel { get; set; } = "16 oz";
    public bool SizeSmActive { get; set; } = true;
    public bool SizeMdActive { get; set; } = true;
    public bool SizeLgActive { get; set; } = true;
    public string SizeDefaultKey { get; set; } = "M";
}