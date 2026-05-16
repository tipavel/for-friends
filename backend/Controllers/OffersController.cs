using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OffersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OffersController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Offers.OrderBy(x => x.SortOrder).ThenBy(x => x.Id).ToListAsync());

    [HttpGet("active")]
    public async Task<IActionResult> GetActive() =>
        Ok(await _db.Offers.Where(x => x.Active).OrderBy(x => x.SortOrder).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Offer body)
    {
        _db.Offers.Add(body);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), body);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Offer body)
    {
        var offer = await _db.Offers.FindAsync(id);
        if (offer is null) return NotFound();
        offer.Title = body.Title;
        offer.TitleAr = body.TitleAr;
        offer.Subtitle = body.Subtitle;
        offer.SubtitleAr = body.SubtitleAr;
        offer.Emoji = body.Emoji;
        offer.BgColor = body.BgColor;
        offer.CtaLabel = body.CtaLabel;
        offer.CtaLink = body.CtaLink;
        offer.Active = body.Active;
        offer.SortOrder = body.SortOrder;
        await _db.SaveChangesAsync();
        return Ok(offer);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var offer = await _db.Offers.FindAsync(id);
        if (offer is null) return NotFound();
        _db.Offers.Remove(offer);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
