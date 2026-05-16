using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SettingsController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _db.AppSettings.FirstAsync());

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] AppSetting body)
    {
        var item = await _db.AppSettings.FirstAsync();
        item.TaxPercent = body.TaxPercent;
        item.EditableFooterEn = body.EditableFooterEn;
        item.EditableFooterAr = body.EditableFooterAr;
        item.PickupLocation = body.PickupLocation;
        item.PickupPhone = body.PickupPhone;
        item.SizeSmMult = body.SizeSmMult > 0 ? body.SizeSmMult : 1.0m;
        item.SizeMdMult = body.SizeMdMult > 0 ? body.SizeMdMult : 1.25m;
        item.SizeLgMult = body.SizeLgMult > 0 ? body.SizeLgMult : 1.5m;
        item.SizeSmLabel = string.IsNullOrWhiteSpace(body.SizeSmLabel) ? "8 oz" : body.SizeSmLabel;
        item.SizeMdLabel = string.IsNullOrWhiteSpace(body.SizeMdLabel) ? "12 oz" : body.SizeMdLabel;
        item.SizeLgLabel = string.IsNullOrWhiteSpace(body.SizeLgLabel) ? "16 oz" : body.SizeLgLabel;
        item.SizeSmActive = body.SizeSmActive;
        item.SizeMdActive = body.SizeMdActive;
        item.SizeLgActive = body.SizeLgActive;
        item.SizeDefaultKey = new[] { "S", "M", "L" }.Contains(body.SizeDefaultKey) ? body.SizeDefaultKey : "M";
        await _db.SaveChangesAsync();
        return Ok(item);
    }
}
