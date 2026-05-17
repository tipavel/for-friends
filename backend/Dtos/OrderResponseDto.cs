namespace backend.Dtos;

public class OrderResponseDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Notes { get; set; } = "";
    public string Pickup { get; set; } = "ASAP";
    public string Status { get; set; } = "new";

    public string PaymentMethod { get; set; } = "pickup";
    public string PaymentStatus { get; set; } = "unpaid";
    public string PaymentId { get; set; } = "";
    public string PaymentMessage { get; set; } = "";

    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public string PromoCode { get; set; } = "";
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public DateTime Time { get; set; }

    public List<OrderItemResponseDto> Items { get; set; } = new();
}

public class OrderItemResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Emoji { get; set; } = "";
    public int Qty { get; set; }
}