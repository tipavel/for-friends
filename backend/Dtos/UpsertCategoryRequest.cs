namespace backend.Dtos;

public class UpsertCategoryRequest
{
    public string Name { get; set; } = "";
    public string NameAr { get; set; } = "";
    public string Slug { get; set; } = "";
    public string? Emoji { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}