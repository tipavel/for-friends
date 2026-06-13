using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriesController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.Categories.OrderBy(x => x.SortOrder).ThenBy(x => x.Id).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Category body)
    {
        body.Key = body.Key.Trim().ToLowerInvariant();
        _db.Categories.Add(body);
        await _db.SaveChangesAsync();
        return Ok(body);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Category body)
    {
        var item = await _db.Categories.FindAsync(id);
        if (item is null) return NotFound();
        item.Key = body.Key.Trim().ToLowerInvariant();
        item.Name = body.Name;
        item.NameAr = body.NameAr;
        item.SortOrder = body.SortOrder;
        item.Active = body.Active;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Categories.FindAsync(id);
        if (item is null) return NotFound();
        _db.Categories.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
