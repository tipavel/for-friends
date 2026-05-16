namespace backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Key { get; set; } = "";
    public string Name { get; set; } = "";
    public string NameAr { get; set; } = "";
    public int SortOrder { get; set; } = 0;
    public bool Active { get; set; } = true;
}
