using ApiRunner.Data;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using OpenAI;

// Load .env file if it exists
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Register database (SQLite for simplicity)
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite("Data Source=api-runner.db")); // You can replace with other DBs later

// Enable CORS for your frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFrontend",
        policy =>
        {
            var allowedOrigins = new List<string>
            {
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:4173", // Vite preview
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

        // Vercel deployment URLs
        allowedOrigins.Add("https://routerunner.vercel.app");
        allowedOrigins.Add("https://route-runner-one.vercel.app");
        allowedOrigins.Add("https://route-runner-ibukuns-projects-f499c0c8.vercel.app");
        allowedOrigins.Add("https://route-runner-ibukunsanni-ibukuns-projects-f499c0c8.vercel.app");
        allowedOrigins.Add("https://route-runner-3h2wqynyn-ibukunsanni-projects.vercel.app");
        
        // Support Vercel preview deployments with wildcard pattern
        // This allows any subdomain of vercel.app (for preview deployments)
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .SetIsOriginAllowedToAllowWildcardSubdomains()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials() // Allow cookies if needed
              .SetIsOriginAllowed(origin => 
              {
                  // Allow any Vercel deployment (including preview deployments)
                  if (origin.Contains(".vercel.app") || origin.Contains("vercel.app"))
                      return true;
                  
                  // Check against the list of allowed origins
                  return allowedOrigins.Contains(origin);
              });
        }
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add OpenAI service
var openAiApiKey =
    builder.Configuration["OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
if (!string.IsNullOrEmpty(openAiApiKey))
{
    builder.Services.AddSingleton(
        new OpenAI.OpenAIClient(openAiApiKey).GetChatClient("gpt-3.5-turbo")
    );
}
else
{
    // Fallback for development - you can remove this in production
    builder.Services.AddSingleton<OpenAI.Chat.ChatClient>(provider =>
        throw new InvalidOperationException("OpenAI API key not configured")
    );
}

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
var port = "5088"; // Default development port
if (!app.Environment.IsDevelopment())
{
    port = Environment.GetEnvironmentVariable("PORT") ?? "8080";

    // Clear any default URLs and set only one binding for production
    app.Urls.Clear();
    app.Urls.Add($"http://0.0.0.0:{port}");
}

app.Logger.LogInformation($"Starting application on port {port}");
app.Logger.LogInformation("Deployment Version: v1.0.2 - CORS policy fixed for Vercel deployments");
app.Run();
