namespace backend.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Emoji { get; set; } = "";
    public int Qty { get; set; }

    public string OrderId { get; set; } = "";
    public Order? Order { get; set; }
}