namespace backend.Dtos;

public class CreateOrderRequest
{
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Notes { get; set; } = "";
    public string Pickup { get; set; } = "ASAP";
    public string PaymentMethod { get; set; } = "pickup";
    public string PromoCode { get; set; } = "";
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}