using Microsoft.AspNetCore.Mvc;
using ApiRunner.Models;
using ApiRunner.Data;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;

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

            var values = runRequest?.Values ?? new();
            var results = new List<RunResult>();

            foreach (var req in integration.Requests)
            {
                var message = new HttpRequestMessage(new HttpMethod(req.Method), req.Url);

                // Add headers
                if (req.Headers != null)
                {
                    foreach (var header in req.Headers)
                    {
                        message.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }
                }

                // Add body if applicable
                if (!string.IsNullOrWhiteSpace(req.Body) &&
                    (req.Method.ToUpper() is "POST" or "PUT" or "PATCH"))
                {
                    message.Content = new StringContent(req.Body, Encoding.UTF8, "application/json");
                }

                var stopwatch = Stopwatch.StartNew();
                try
                {
                    var response = await httpClient.SendAsync(message);
                    stopwatch.Stop();

                    var body = await response.Content.ReadAsStringAsync();

                    results.Add(new RunResult
                    {
                        Url = req.Url,
                        Method = req.Method,
                        StatusCode = (int)response.StatusCode,
                        DurationMs = stopwatch.ElapsedMilliseconds,
                        ResponseBody = TryPrettyPrintJson(body),
                        IsSuccess = response.IsSuccessStatusCode
                    });
                }
                catch (Exception ex)
                {
                    stopwatch.Stop();
                    results.Add(new RunResult
                    {
                        Url = req.Url,
                        Method = req.Method,
                        StatusCode = 0,
                        DurationMs = stopwatch.ElapsedMilliseconds,
                        ResponseBody = $"Error: {ex.Message}",
                        IsSuccess = false
                    });
                }
            }

            return Ok(results);
        }

        private static string TryPrettyPrintJson(string json)
        {
            try
            {
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(json);
                return JsonSerializer.Serialize(jsonElement, new JsonSerializerOptions
                {
                    WriteIndented = true
                });
            }
            catch
            {
                return json;
            }
        }

        public class RunRequest
        {
            public Dictionary<string, string>? Values { get; set; }
        }

    }
}
