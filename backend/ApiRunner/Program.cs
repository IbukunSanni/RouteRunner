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

// Configure port for production deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "5088";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();
