using backend.Data;
using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuthController(AppDbContext db) { _db = db; }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var account = await _db.StaffAccounts.FirstOrDefaultAsync(x =>
            x.Active && x.Username == request.Username && x.Password == request.Password);

        if (account is null)
            return Unauthorized(new { success = false, message = "Invalid credentials" });

        return Ok(new
        {
            success = true,
            user = new { username = account.Username, role = account.Role, name = account.Name },
            token = $"demo-{account.Role}-token"
        });
    }
}
