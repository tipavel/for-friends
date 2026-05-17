namespace backend.Models;

public class Order
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Notes { get; set; } = "";
    public string Pickup { get; set; } = "ASAP";
    public string Status { get; set; } = "new";

    public string PaymentMethod { get; set; } = "pickup";   // pickup | creditcard | stcpay
    public string PaymentStatus { get; set; } = "unpaid";   // unpaid | paid | failed
    public string PaymentId { get; set; } = "";
    public string PaymentMessage { get; set; } = "";

    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; } = 0;
    public string PromoCode { get; set; } = "";
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public DateTime Time { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();
}