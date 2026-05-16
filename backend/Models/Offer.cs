namespace backend.Models;

public class Offer
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string TitleAr { get; set; } = "";
    public string Subtitle { get; set; } = "";
    public string SubtitleAr { get; set; } = "";
    public string Emoji { get; set; } = "🎉";
    public string BgColor { get; set; } = "#c07d40";
    public string CtaLabel { get; set; } = "Order Now";
    public string CtaLink { get; set; } = "/#menu";
    public bool Active { get; set; } = true;
    public int SortOrder { get; set; } = 0;
}
