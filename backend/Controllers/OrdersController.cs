using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _db.Orders.Include(x => x.Items).OrderByDescending(x => x.Time).ToListAsync();
        return Ok(orders.Select(MapOrder));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _db.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        return order is null ? NotFound() : Ok(MapOrder(order));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        if (!string.Equals(request.PaymentMethod, "pickup", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Online payments must go through /api/payments/verify-and-create-order" });

        if (request.Items is null || request.Items.Count == 0)
            return BadRequest(new { message = "At least one item is required" });

        if (request.Items.Any(x => x.Qty <= 0))
            return BadRequest(new { message = "Item quantity must be greater than 0" });

        var settings = await _db.AppSettings.FirstAsync();
        var orderItems = new List<OrderItem>();
        foreach (var requestItem in request.Items)
        {
            var menuItem = await _db.MenuItems.FirstOrDefaultAsync(x => x.Id == requestItem.Id && x.Avail);
            if (menuItem is null) return BadRequest(new { message = $"Menu item {requestItem.Id} not found or unavailable" });
            orderItems.Add(new OrderItem { MenuItemId = menuItem.Id, Name = menuItem.Name, Price = menuItem.Price, Emoji = menuItem.Emoji, Qty = requestItem.Qty });
        }

        var subtotal = orderItems.Sum(x => x.Price * x.Qty);
        var discount = 0m;
        var appliedPromo = "";
        if (!string.IsNullOrWhiteSpace(request.PromoCode))
        {
            var promo = await _db.PromoCodes.FirstOrDefaultAsync(p => p.Code.ToUpper() == request.PromoCode.ToUpper() && p.Active);
            if (promo != null && (promo.ExpiresAt == null || promo.ExpiresAt > DateTime.UtcNow) && (promo.MaxUses == 0 || promo.UseCount < promo.MaxUses))
            {
                discount = Math.Round(subtotal * promo.DiscountPercent / 100m, 2);
                appliedPromo = promo.Code.ToUpper();
                promo.UseCount++;
            }
        }

        var afterDiscount = subtotal - discount;
        var tax = Math.Round(afterDiscount * (settings.TaxPercent / 100m), 2);
        var total = afterDiscount + tax;
        var displayName = string.IsNullOrWhiteSpace(request.Name) ? "Walk-in Customer" : request.Name.Trim();

        var order = new Order
        {
            Id = await GetNextOrderId(),
            Name = displayName,
            Phone = request.Phone?.Trim() ?? "",
            Notes = request.Notes?.Trim() ?? "",
            Pickup = string.IsNullOrWhiteSpace(request.Pickup) ? "ASAP" : request.Pickup,
            Status = "new",
            PaymentMethod = "pickup",
            PaymentStatus = "unpaid",
            Subtotal = subtotal,
            Discount = discount,
            PromoCode = appliedPromo,
            Tax = tax,
            Total = total,
            Time = DateTime.UtcNow,
            Items = orderItems
        };

        _db.Orders.Add(order);
        await UpsertCustomerProfile(request, displayName);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, MapOrder(order));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusRequest request)
    {
        var validStatuses = new[] { "new", "preparing", "ready", "done" };
        if (request is null || string.IsNullOrWhiteSpace(request.Status) || !validStatuses.Contains(request.Status))
            return BadRequest(new { message = "Invalid status" });
        var order = await _db.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        if (order is null) return NotFound();
        order.Status = request.Status;
        await _db.SaveChangesAsync();
        return Ok(MapOrder(order));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var order = await _db.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id);
        if (order is null) return NotFound();
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task UpsertCustomerProfile(CreateOrderRequest request, string displayName)
    {
        if (string.IsNullOrWhiteSpace(request.Phone) && string.IsNullOrWhiteSpace(displayName)) return;
        var customer = await _db.CustomerProfiles.FirstOrDefaultAsync(x => x.Phone == (request.Phone ?? ""));
        if (customer is null)
        {
            customer = new CustomerProfile { Name = displayName, Phone = request.Phone?.Trim() ?? "", LastNotes = request.Notes ?? "", LastPickup = string.IsNullOrWhiteSpace(request.Pickup) ? "ASAP" : request.Pickup, LastOrderAt = DateTime.UtcNow, TotalOrders = 1 };
            _db.CustomerProfiles.Add(customer);
        }
        else
        {
            customer.Name = string.IsNullOrWhiteSpace(request.Name) ? customer.Name : request.Name.Trim();
            customer.LastNotes = request.Notes ?? "";
            customer.LastPickup = string.IsNullOrWhiteSpace(request.Pickup) ? "ASAP" : request.Pickup;
            customer.LastOrderAt = DateTime.UtcNow;
            customer.TotalOrders += 1;
        }
    }

    private async Task<string> GetNextOrderId()
    {
        var lastOrder = await _db.Orders.OrderByDescending(x => x.Time).FirstOrDefaultAsync();
        var nextNumber = 1001;
        if (lastOrder is not null && lastOrder.Id.StartsWith("B") && int.TryParse(lastOrder.Id[1..], out var number)) nextNumber = number + 1;
        return $"B{nextNumber}";
    }

    private static OrderResponseDto MapOrder(Order order) => new()
    {
        Id = order.Id, Name = order.Name, Phone = order.Phone, Notes = order.Notes, Pickup = order.Pickup,
        Status = order.Status, PaymentMethod = order.PaymentMethod, PaymentStatus = order.PaymentStatus,
        PaymentId = order.PaymentId, PaymentMessage = order.PaymentMessage, Subtotal = order.Subtotal,
        Discount = order.Discount, PromoCode = order.PromoCode, Tax = order.Tax, Total = order.Total, Time = order.Time,
        Items = order.Items.Select(i => new OrderItemResponseDto { Id = i.MenuItemId, Name = i.Name, Price = i.Price, Emoji = i.Emoji, Qty = i.Qty }).ToList()
    };
}
