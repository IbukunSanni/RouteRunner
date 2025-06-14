using Microsoft.AspNetCore.Mvc;
using ApiRunner.Models;
using ApiRunner.Data;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using static ApiRunner.Helpers.HttpHelpers;
using ApiRunner.Helpers;


namespace ApiRunner.Controllers
{
    [ApiController]
    [Route("integrations")] // 🔹 No leading slash to avoid double slashing when hosted
    public class IntegrationsController : ControllerBase
    {
        private static readonly HttpClient httpClient = new(); // 🔹 Reuse HttpClient globally
        [HttpPost]
        public IActionResult Create([FromBody] Integration integration)
        {
            if (integration == null) return BadRequest("Integration cannot be null");

            integration.Id = Guid.NewGuid(); // 🔹 Ensure ID is unique and generated server-side
            FakeDatabase.Integrations.Add(integration);

            return CreatedAtAction(nameof(GetAll), new { id = integration.Id }, integration);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(FakeDatabase.Integrations);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == id);
            return integration is null ? NotFound() : Ok(integration);
        }
        [HttpPut("{id}")]
        public IActionResult UpdateIntegration(Guid id, [FromBody] Integration updated)
        {
            var index = FakeDatabase.Integrations.FindIndex(i => i.Id == id);
            if (index == -1) return NotFound();

            updated.Id = id; // preserve existing ID
            FakeDatabase.Integrations[index] = updated;

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteIntegration(Guid id)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == id);
            if (integration == null) return NotFound();

            FakeDatabase.Integrations.Remove(integration);
            return Ok(new
            {
                message = "Integration deleted successfully",
                deleted = integration
            });
        }


        [HttpPost("{id}/run")]
        public async Task<IActionResult> RunIntegration(Guid id, [FromBody] RunRequest? runRequest)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == id);
            if (integration == null) return NotFound();
            DebugLogger.Enabled = false;

            var values = runRequest?.Values ?? new();
            DebugLogger.Log("Runtime Values:");

            foreach (var kv in values)
            {
                DebugLogger.Log($"  {kv.Key}: {kv.Value}");
            }

            var results = new List<RunResult>();

            Console.WriteLine($"[INFO] Starting integration run for ID: {id}");

            foreach (var req in integration.Requests)
            {
                var url = ApplyPlaceholders(req.Url, values);
                var method = new HttpMethod(req.Method.ToUpper());
                var message = new HttpRequestMessage(method, url);

                foreach (var header in req.Headers ?? new())
                {
                    var headerValue = ApplyPlaceholders(header.Value, values);
                    message.Headers.TryAddWithoutValidation(header.Key, headerValue);
                }

                if (!string.IsNullOrWhiteSpace(req.Body) && method != HttpMethod.Get)
                {
                    var resolvedBody = ApplyPlaceholders(req.Body, values);
                    message.Content = new StringContent(resolvedBody, Encoding.UTF8, "application/json");
                }

                Console.WriteLine($"[INFO] Running {req.Method.ToUpper()} {url}");
                var stopwatch = Stopwatch.StartNew();

                HttpResponseMessage response;
                string responseBody;

                try
                {
                    response = await httpClient.SendAsync(message);
                    responseBody = await response.Content.ReadAsStringAsync();
                    stopwatch.Stop();

                    Console.WriteLine($"[INFO] {req.Method.ToUpper()} {url} - {(int)response.StatusCode} {response.StatusCode} in {stopwatch.ElapsedMilliseconds}ms");
                }
                catch (Exception ex)
                {
                    stopwatch.Stop();
                    Console.WriteLine($"[ERROR] {req.Method.ToUpper()} {url} failed: {ex.Message}");

                    results.Add(new RunResult
                    {
                        Url = url,
                        Method = req.Method,
                        StatusCode = 0,
                        DurationMs = stopwatch.ElapsedMilliseconds,
                        ResponseBody = $"Error: {ex.Message}",
                        IsSuccess = false
                    });
                    continue;
                }

                if (req.Extractors != null && req.Extractors.Any())
                {
                    try
                    {
                        ExtractValuesFromResponse(responseBody, req.Extractors, values);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[ERROR] Failed to extract values from {url}: {ex.Message}");
                    }
                }

                results.Add(new RunResult
                {
                    Url = url,
                    Method = req.Method,
                    StatusCode = (int)response.StatusCode,
                    DurationMs = stopwatch.ElapsedMilliseconds,
                    ResponseBody = TryPrettyPrintJson(responseBody),
                    IsSuccess = response.IsSuccessStatusCode
                });
            }

            Console.WriteLine($"[INFO] Finished integration run.");

            return Ok(results);
        }


        public class RunRequest
        {
            public Dictionary<string, string>? Values { get; set; }
        }

    }
}