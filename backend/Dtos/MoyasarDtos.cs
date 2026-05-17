namespace backend.Dtos;

public class MoyasarConfigResponse
{
    public string PublishableKey { get; set; } = "";
    public string CallbackUrl { get; set; } = "";
    public string Currency { get; set; } = "SAR";
}

public class VerifyPaymentAndCreateOrderRequest
{
    public string PaymentId { get; set; } = "";
    public CreateOrderRequest Order { get; set; } = new();
}

public class MoyasarPaymentResponse
{
    public string Id { get; set; } = "";
    public string Status { get; set; } = "";
    public int Amount { get; set; }
    public string Currency { get; set; } = "";
    public string Description { get; set; } = "";
    public string Callback_Url { get; set; } = "";
    public MoyasarSourceResponse? Source { get; set; }
}

public class MoyasarSourceResponse
{
    public string Type { get; set; } = "";
    public string Company { get; set; } = "";
    public string Message { get; set; } = "";
    public string Transaction_Url { get; set; } = "";
}

public class MoyasarWebhookRequest
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Created_At { get; set; } = "";
    public string Secret_Token { get; set; } = "";
    public bool Live { get; set; }
    public MoyasarPaymentResponse? Data { get; set; }
}