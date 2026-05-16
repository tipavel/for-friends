using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromoController : ControllerBase
{
    private readonly AppDbContext _db;

    public PromoController(AppDbContext db) { _db = db; }

    // GET /api/promo  (admin)
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.PromoCodes.OrderByDescending(x => x.Id).ToListAsync());

    // POST /api/promo/validate?code=XX
    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromQuery] string code, [FromQuery] decimal subtotal = 0)
    {
        if (string.IsNullOrWhiteSpace(code))
            return BadRequest(new { message = "Code is required" });

        var promo = await _db.PromoCodes
            .FirstOrDefaultAsync(p => p.Code.ToUpper() == code.ToUpper() && p.Active);

        if (promo == null)
            return NotFound(new { message = "Invalid promo code" });

        if (promo.ExpiresAt != null && promo.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Promo code has expired" });

        if (promo.MaxUses > 0 && promo.UseCount >= promo.MaxUses)
            return BadRequest(new { message = "Promo code has reached its usage limit" });

        var discountAmount = Math.Round(subtotal * promo.DiscountPercent / 100, 2);
        return Ok(new
        {
            code = promo.Code.ToUpper(),
            discountPercent = promo.DiscountPercent,
            discountAmount,
            message = $"{promo.DiscountPercent}% off applied!"
        });
    }

    // POST /api/promo  (admin create)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PromoCode body)
    {
        body.Code = body.Code.ToUpper().Trim();
        body.UseCount = 0;
        _db.PromoCodes.Add(body);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), body);
    }

    // DELETE /api/promo/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.PromoCodes.FindAsync(id);
        if (p is null) return NotFound();
        _db.PromoCodes.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/promo/{id}/toggle
    [HttpPatch("{id:int}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var p = await _db.PromoCodes.FindAsync(id);
        if (p is null) return NotFound();
        p.Active = !p.Active;
        await _db.SaveChangesAsync();
        return Ok(p);
    }
}
