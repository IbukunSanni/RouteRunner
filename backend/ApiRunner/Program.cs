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
            "http://localhost:3000",
            "http://localhost:4173" // Vite preview
        };

        // Add production frontend URLs from environment variable
        var frontendUrl = builder.Configuration["FRONTEND_URL"];
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            // Support comma-separated URLs
            var urls = frontendUrl.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var url in urls)
            {
                allowedOrigins.Add(url.Trim());
            }
        }

        // Common Vercel deployment patterns
        allowedOrigins.Add("https://routerunner.vercel.app");
        // Note: For Vercel preview deployments, you'll need to add specific URLs or use SetIsOriginAllowedToAllowWildcardSubdomains
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Allow cookies if needed
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

// Clear any default URLs and set only one binding
app.Urls.Clear();
app.Urls.Add($"http://0.0.0.0:{port}");

app.Logger.LogInformation($"Starting application on port {port}");
app.Run();
