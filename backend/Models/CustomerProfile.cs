namespace backend.Models;

public class CustomerProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string LastNotes { get; set; } = "";
    public string LastPickup { get; set; } = "ASAP";
    public int TotalOrders { get; set; } = 0;
    public DateTime LastOrderAt { get; set; } = DateTime.UtcNow;
}
