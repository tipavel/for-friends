using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffAccountsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StaffAccountsController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.StaffAccounts.OrderBy(x => x.Id).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StaffAccount body)
    {
        _db.StaffAccounts.Add(body);
        await _db.SaveChangesAsync();
        return Ok(body);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] StaffAccount body)
    {
        var item = await _db.StaffAccounts.FindAsync(id);
        if (item is null) return NotFound();
        item.Name = body.Name;
        item.Username = body.Username;
        item.Password = body.Password;
        item.Role = body.Role;
        item.Active = body.Active;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.StaffAccounts.FindAsync(id);
        if (item is null) return NotFound();
        _db.StaffAccounts.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
