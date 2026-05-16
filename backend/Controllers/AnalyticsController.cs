using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var orders = await _db.Orders
            .Include(x => x.Items)
            .ToListAsync();

        var doneOrders = orders.Where(x => x.Status == "done").ToList();
        var revenue = doneOrders.Sum(x => x.Total);
        var avgOrder = orders.Count == 0 ? 0 : orders.Average(x => x.Total);

        var topItems = orders
            .SelectMany(o => o.Items)
            .GroupBy(i => i.Name)
            .Select(g => new
            {
                name = g.Key,
                count = g.Sum(x => x.Qty)
            })
            .OrderByDescending(x => x.count)
            .Take(5)
            .ToList();

        return Ok(new
        {
            totalOrders = orders.Count,
            revenue,
            avgOrder = Math.Round(avgOrder, 2),
            pending = orders.Count(x => x.Status != "done"),
            statusBreakdown = new
            {
                @new = orders.Count(x => x.Status == "new"),
                preparing = orders.Count(x => x.Status == "preparing"),
                ready = orders.Count(x => x.Status == "ready"),
                done = orders.Count(x => x.Status == "done")
            },
            topItems
        });
    }
}