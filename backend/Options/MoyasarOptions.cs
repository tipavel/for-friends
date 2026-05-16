namespace backend.Options;

public class MoyasarOptions
{
    public string PublishableKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string Currency { get; set; } = "SAR";
    public string FrontendBaseUrl { get; set; } = "";
    public string WebhookSecret { get; set; } = "";
}