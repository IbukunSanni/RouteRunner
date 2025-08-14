using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace ApiRunner.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;
        private readonly IConfiguration _configuration;

        public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Basic health check endpoint
        /// </summary>
        [HttpGet]
        [Route("/health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Unknown"
            });
        }

        /// <summary>
        /// Detailed health check with application info
        /// </summary>
        [HttpGet]
        [Route("/health/details")]
        public IActionResult HealthDetails()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var version = assembly.GetName().Version?.ToString() ?? "1.0.0";
            
            var healthInfo = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                application = new
                {
                    name = "ApiRunner",
                    version = version,
                    environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Unknown",
                    dotnetVersion = Environment.Version.ToString()
                },
                system = new
                {
                    machineName = Environment.MachineName,
                    osVersion = Environment.OSVersion.ToString(),
                    processorCount = Environment.ProcessorCount,
                    is64BitProcess = Environment.Is64BitProcess
                },
                uptime = GetUptime()
            };

            _logger.LogInformation("Health check performed at {Timestamp}", healthInfo.timestamp);
            return Ok(healthInfo);
        }

        /// <summary>
        /// Liveness probe for Kubernetes/container orchestration
        /// </summary>
        [HttpGet]
        [Route("/health/live")]
        public IActionResult Live()
        {
            // Simple liveness check - returns 200 if the application is running
            return Ok(new { status = "alive", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Readiness probe for Kubernetes/container orchestration
        /// </summary>
        [HttpGet]
        [Route("/health/ready")]
        public async Task<IActionResult> Ready()
        {
            try
            {
                // Add checks for external dependencies here
                // For example, database connectivity, external APIs, etc.
                
                // Example: Check if database is accessible (uncomment when using EF Core)
                // var dbContext = HttpContext.RequestServices.GetService<AppDbContext>();
                // if (dbContext != null)
                // {
                //     var canConnect = await dbContext.Database.CanConnectAsync();
                //     if (!canConnect)
                //     {
                //         return StatusCode(503, new { status = "not ready", reason = "database unavailable" });
                //     }
                // }

                return Ok(new 
                { 
                    status = "ready", 
                    timestamp = DateTime.UtcNow,
                    checks = new
                    {
                        database = "ready",  // Update when database is configured
                        cache = "ready",     // Update if using cache
                        external_apis = "ready"  // Update if using external APIs
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Readiness check failed");
                return StatusCode(503, new 
                { 
                    status = "not ready", 
                    error = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
        }

        private string GetUptime()
        {
            var uptime = DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime();
            return $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m {uptime.Seconds}s";
        }
    }
}
