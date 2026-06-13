namespace backend.Models;

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string NameAr { get; set; } = "";
    public string Cat { get; set; } = "";
    public decimal Price { get; set; }
    public string Emoji { get; set; } = "";
    public string Desc { get; set; } = "";
    public string DescAr { get; set; } = "";
    public bool Avail { get; set; }
    public int Calories { get; set; } = 0;
    public string ImageUrl { get; set; } = "";
    public int SortOrder { get; set; } = 0;
    // Per-item size options stored as JSON array: [{key,label,price,active,isDefault}]
    // Empty string = no size options (single-price item)
    public string SizesJson { get; set; } = "";
}
