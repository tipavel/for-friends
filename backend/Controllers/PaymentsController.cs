using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly HttpClient _httpClient;
    private readonly MoyasarOptions _moyasar;


    public PaymentsController(
        AppDbContext db,
        IHttpClientFactory httpClientFactory,
        IOptions<MoyasarOptions> moyasarOptions)
    {
        _db = db;
        _httpClient = httpClientFactory.CreateClient();
        _moyasar = moyasarOptions.Value;
    }

    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        return Ok(new MoyasarConfigResponse
        {
            PublishableKey = _moyasar.PublishableKey,
            CallbackUrl = $"{_moyasar.FrontendBaseUrl.TrimEnd('/')}/payment-result",
            Currency = _moyasar.Currency
        });
    }

    [HttpPost("verify-and-create-order")]
    public async Task<IActionResult> VerifyAndCreateOrder([FromBody] VerifyPaymentAndCreateOrderRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.PaymentId))
            return BadRequest(new { message = "Payment ID is required" });

        if (request.Order is null)
            return BadRequest(new { message = "Order payload is required" });

        if (request.Order.Items is null || request.Order.Items.Count == 0)
            return BadRequest(new { message = "At least one item is required" });

        var existingOrder = await _db.Orders
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.PaymentId == request.PaymentId);

        if (existingOrder is not null)
            return Ok(MapOrder(existingOrder));

        var payment = await FetchMoyasarPayment(request.PaymentId);
        if (payment is null)
            return BadRequest(new { message = "Unable to fetch payment from Moyasar" });

        if (!string.Equals(payment.Status, "paid", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = $"Payment is not paid. Current status: {payment.Status}" });

        var draft = await BuildOrderDraft(request.Order);
        if (!draft.Success)
            return BadRequest(new { message = draft.ErrorMessage });

        var order = new Order
        {
            Id = await GetNextOrderId(),
            Name = string.IsNullOrWhiteSpace(request.Order.Name) ? "Walk-in Customer" : request.Order.Name,
            Phone = request.Order.Phone ?? "",
            Notes = request.Order.Notes ?? "",
            Pickup = string.IsNullOrWhiteSpace(request.Order.Pickup) ? "ASAP" : request.Order.Pickup,
            Status = "new",
            PaymentMethod = NormalizePaymentMethod(request.Order.PaymentMethod),
            PaymentStatus = "paid",
            PaymentId = payment.Id,
            Subtotal = draft.Subtotal,
            Discount = draft.Discount,
            PromoCode = draft.PromoCode,
            Tax = draft.Tax,
            Total = draft.Total,
            Time = DateTime.UtcNow,
            Items = draft.Items
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(MapOrder(order));
    }

    private async Task<MoyasarPaymentResponse?> FetchMoyasarPayment(string paymentId)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.moyasar.com/v1/payments/{paymentId}");
        var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_moyasar.SecretKey}:"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<MoyasarPaymentResponse>(
            json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private async Task<OrderDraftResult> BuildOrderDraft(CreateOrderRequest request)
    {
        var orderItems = new List<OrderItem>();

        foreach (var requestItem in request.Items)
        {
            var menuItem = await _db.MenuItems.FirstOrDefaultAsync(x => x.Id == requestItem.Id && x.Avail);
            if (menuItem is null)
            {
                return new OrderDraftResult
                {
                    Success = false,
                    ErrorMessage = "Item not found"
                };
            }

            orderItems.Add(new OrderItem
            {
                MenuItemId = menuItem.Id,
                Name = menuItem.Name,
                Price = menuItem.Price,
                Emoji = menuItem.Emoji,
                Qty = requestItem.Qty
            });
        }

        var subtotal = orderItems.Sum(x => x.Price * x.Qty);
        var settings = await _db.AppSettings.FirstAsync();

        // Apply promo code discount if provided
        var discount = 0m;
        var appliedPromo = "";
        if (!string.IsNullOrWhiteSpace(request.PromoCode))
        {
            var promo = await _db.PromoCodes.FirstOrDefaultAsync(p =>
                p.Code.ToUpper() == request.PromoCode.ToUpper() && p.Active);
            if (promo != null &&
                (promo.ExpiresAt == null || promo.ExpiresAt > DateTime.UtcNow) &&
                (promo.MaxUses == 0 || promo.UseCount < promo.MaxUses))
            {
                discount = Math.Round(subtotal * promo.DiscountPercent / 100m, 2);
                appliedPromo = promo.Code.ToUpper();
                promo.UseCount++;
            }
        }

        var afterDiscount = subtotal - discount;
        var tax = Math.Round(afterDiscount * (settings.TaxPercent / 100m), 2);

        return new OrderDraftResult
        {
            Success = true,
            Items = orderItems,
            Subtotal = subtotal,
            Discount = discount,
            PromoCode = appliedPromo,
            Tax = tax,
            Total = afterDiscount + tax
        };
    }

    private static string NormalizePaymentMethod(string method) => method switch
    {
        "creditcard" => "creditcard",
        "stcpay" => "stcpay",
        _ => "pickup"
    };

    private async Task<string> GetNextOrderId()
    {
        var lastOrder = await _db.Orders
            .OrderByDescending(x => x.Time)
            .FirstOrDefaultAsync();

        int nextNumber = 1001;

        if (lastOrder != null && int.TryParse(lastOrder.Id[1..], out var num))
            nextNumber = num + 1;

        return $"B{nextNumber}";
    }

    private static OrderResponseDto MapOrder(Order order) => new OrderResponseDto
    {
        Id = order.Id,
        Name = order.Name,
        Phone = order.Phone,
        Notes = order.Notes,
        Pickup = order.Pickup,
        Status = order.Status,
        PaymentMethod = order.PaymentMethod,
        PaymentStatus = order.PaymentStatus,
        PaymentId = order.PaymentId,
        PaymentMessage = order.PaymentMessage,
        Subtotal = order.Subtotal,
        Discount = order.Discount,
        PromoCode = order.PromoCode,
        Tax = order.Tax,
        Total = order.Total,
        Time = order.Time,
        Items = order.Items.Select(i => new OrderItemResponseDto
        {
            Id = i.MenuItemId,
            Name = i.Name,
            Price = i.Price,
            Emoji = i.Emoji,
            Qty = i.Qty
        }).ToList()
    };

    private class OrderDraftResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; } = "";
        public List<OrderItem> Items { get; set; } = new();
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public string PromoCode { get; set; } = "";
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
    }
}