using ApiRunner.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Register database (SQLite for simplicity)
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite("Data Source=api-runner.db")); // You can replace with other DBs later

// Enable CORS for your frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = new List<string>
        {
            "http://localhost:5173",
            "http://localhost:3000"
        };

        // Add production frontend URL from environment variable
        var frontendUrl = builder.Configuration["FRONTEND_URL"];
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            allowedOrigins.Add(frontendUrl);
        }

        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment() || builder.Configuration["EnableSwagger"] == "true")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Configure port for production deployment (Fly.io, Kinsta, etc.)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
var urls = new[] { $"http://0.0.0.0:{port}", $"http://[::]:{port}" }; // Support both IPv4 and IPv6
foreach (var url in urls)
{
    app.Urls.Add(url);
}

app.Logger.LogInformation($"Starting application on port {port}");
app.Run();
