using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public MenuController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private string GetUploadsDir()
    {
        var webRoot = _env.WebRootPath
                      ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "images");
        Directory.CreateDirectory(dir);
        return dir;
    }

    private string GetWebRoot()
        => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.MenuItems
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    private static MenuItem MapFromRequest(UpsertMenuItemRequest request) => new()
    {
        Name = request.Name,
        NameAr = request.NameAr,
        Cat = request.Cat,
        Price = request.Price,
        Emoji = request.Emoji,
        Desc = request.Desc,
        DescAr = request.DescAr,
        Avail = request.Avail,
        Calories = request.Calories,
        ImageUrl = request.ImageUrl,
        SortOrder = request.SortOrder,
        SizesJson = request.SizesJson ?? ""
    };

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertMenuItemRequest request)
    {
        var item = MapFromRequest(request);
        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertMenuItemRequest request)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound();

        item.Name = request.Name;
        item.NameAr = request.NameAr;
        item.Cat = request.Cat;
        item.Price = request.Price;
        item.Emoji = request.Emoji;
        item.Desc = request.Desc;
        item.DescAr = request.DescAr;
        item.Avail = request.Avail;
        item.Calories = request.Calories;
        item.ImageUrl = request.ImageUrl;
        item.SortOrder = request.SortOrder;
        item.SizesJson = request.SizesJson ?? "";

        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPatch("{id:int}/availability")]
    public async Task<IActionResult> ToggleAvailability(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound();
        item.Avail = !item.Avail;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound();

        if (!string.IsNullOrEmpty(item.ImageUrl) && item.ImageUrl.StartsWith("/images/"))
        {
            var filePath = Path.Combine(GetWebRoot(), item.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
        }

        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Only JPEG, PNG, WebP, and GIF images are allowed" });

        const long maxSize = 5 * 1024 * 1024;
        if (file.Length > maxSize)
            return BadRequest(new { message = "File size must be under 5 MB" });

        var uploadsDir = GetUploadsDir();
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { url = $"/images/{fileName}" });
    }
}
