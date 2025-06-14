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

            var values = runRequest?.Values ?? new();
            DebugLogger.Log("Runtime Values:");

            foreach (var kv in values)
            {
                DebugLogger.Log($"  {kv.Key}: {kv.Value}");
            }

            var results = new List<RunResult>();

            foreach (var req in integration.Requests)
            {
                var url = Helpers.HttpHelpers.ApplyPlaceholders(req.Url, values);
                var method = new HttpMethod(req.Method.ToUpper());
                var message = new HttpRequestMessage(method, url);

                // Add headers
                foreach (var header in req.Headers ?? new())
                {
                    var headerValue = ApplyPlaceholders(header.Value, values);
                    message.Headers.TryAddWithoutValidation(header.Key, headerValue);
                }

                // Add body if applicable
                if (!string.IsNullOrWhiteSpace(req.Body) && method != HttpMethod.Get)
                {
                    var resolvedBody = ApplyPlaceholders(req.Body, values);
                    message.Content = new StringContent(resolvedBody, Encoding.UTF8, "application/json");
                }


                // Run request
                var stopwatch = Stopwatch.StartNew();
                HttpResponseMessage response;
                string responseBody;

                try
                {
                    // 🔍 LOG REQUEST BEFORE SENDING
                    DebugLogger.LogSeparator("Sending Request");

                    DebugLogger.Log($"Method: {message.Method}");
                    DebugLogger.Log($"URL: {message.RequestUri}");

                    DebugLogger.Log("Headers:");
                    foreach (var header in message.Headers)
                    {
                        DebugLogger.Log($"  {header.Key}: {string.Join(", ", header.Value)}");
                    }

                    if (message.Content != null)
                    {
                        foreach (var header in message.Content.Headers)
                        {
                            DebugLogger.Log($"  {header.Key}: {string.Join(", ", header.Value)}");
                        }

                        string requestBody = await message.Content.ReadAsStringAsync();
                        DebugLogger.Log("Body:");
                        DebugLogger.Log(requestBody);
                    }

                    response = await httpClient.SendAsync(message);
                    responseBody = await response.Content.ReadAsStringAsync();

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
                    continue;
                }
                stopwatch.Stop();
                // Extract values via JSONPath
                if (req.Extractors != null && req.Extractors.Any())
                {
                    ExtractValuesFromResponse(responseBody, req.Extractors, values);
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

            return Ok(results);
        }


        public class RunRequest
        {
            public Dictionary<string, string>? Values { get; set; }
        }

    }
}