using System.Text.Json;
using ApiRunner.Models;
using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;

namespace ApiRunner.Controllers;

[ApiController]
[Route("[controller]")]
public class AiController : ControllerBase
{
    private readonly ChatClient _chatClient;
    private readonly ILogger<AiController> _logger;

    public AiController(ChatClient chatClient, ILogger<AiController> logger)
    {
        _chatClient = chatClient;
        _logger = logger;
    }

    [HttpPost("generate")]
    public async Task<ActionResult<Integration>> GenerateIntegration(
        [FromBody] GenerateIntegrationRequest request
    )
    {
        const int maxRetries = 3;
        
        try
        {
            _logger.LogInformation("Generating integration from prompt: {Prompt}", request.Prompt);

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                _logger.LogInformation("Generation attempt {Attempt}/{MaxRetries}", attempt, maxRetries);
                
                var result = await TryGenerateIntegration(request.Prompt, attempt);
                
                if (result.Success)
                {
                    return Ok(result.Integration);
                }
                
                // If this was the last attempt, return the error
                if (attempt == maxRetries)
                {
                    _logger.LogWarning("All {MaxRetries} attempts failed. Final error: {Error}", maxRetries, result.ErrorMessage);
                    return BadRequest(new
                    {
                        error = "AI generation failed after multiple attempts",
                        details = $"Tried {maxRetries} times but couldn't generate a valid integration. {result.ErrorMessage}",
                        attempt = attempt
                    });
                }
                
                // Log the failure and continue to next attempt
                _logger.LogWarning("Attempt {Attempt} failed: {Error}. Retrying...", attempt, result.ErrorMessage);
            }
            
            // This should never be reached, but just in case
            return StatusCode(500, "Unexpected error in retry logic");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating integration");
            return StatusCode(500, "Failed to generate integration");
        }
    }

    private async Task<GenerationResult> TryGenerateIntegration(string prompt, int attempt)
    {
        try
        {
            var systemPrompt = """
                You are an API integration generator. Convert natural language descriptions into JSON integration objects.

                Return ONLY valid JSON in this exact format:
                {
                  "name": "Integration Name",
                  "requests": [
                    {
                      "name": "Request Name",
                      "method": "GET|POST|PUT|DELETE",
                      "url": "https://api.example.com/endpoint",
                      "headers": {
                        "Content-Type": "application/json"
                      },
                      "body": "{\"key\": \"value\"}",
                      "extractors": {
                        "variableName": "$.jsonPath"
                      }
                    }
                  ]
                }

                Rules:
                - Use realistic API endpoints (JSONPlaceholder, httpbin.org, etc.)
                - Include proper headers
                - Add extractors for chaining requests (use JSONPath like $.id, $.data.token)
                - Use placeholders like {{userId}} for extracted values
                - Keep it simple but functional
                - Do not include id fields - they will be generated automatically
                - CRITICAL: Return ONLY the JSON object, no explanations or markdown formatting
                """;

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(prompt),
            };

            var response = await _chatClient.CompleteChatAsync(messages);
            var content = response.Value.Content[0].Text;

            _logger.LogInformation("LLM Response (attempt {Attempt}): {Response}", attempt, content);

            // Parse the JSON response with proper error handling
            Integration? integration;
            try
            {
                // Try to clean up common JSON formatting issues
                var cleanedContent = CleanJsonResponse(content);

                integration = JsonSerializer.Deserialize<Integration>(
                    cleanedContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
            }
            catch (JsonException ex)
            {
                return new GenerationResult
                {
                    Success = false,
                    ErrorMessage = $"Invalid JSON format: {ex.Message}",
                    RawResponse = content
                };
            }

            if (integration == null)
            {
                return new GenerationResult
                {
                    Success = false,
                    ErrorMessage = "JSON deserialization returned null",
                    RawResponse = content
                };
            }

            // Validate the integration has required fields
            var validationError = ValidateIntegration(integration);
            if (validationError != null)
            {
                return new GenerationResult
                {
                    Success = false,
                    ErrorMessage = validationError,
                    RawResponse = content
                };
            }

            // Always assign fresh IDs (backend responsibility)
            integration.Id = Guid.NewGuid();
            foreach (var req in integration.Requests)
            {
                req.Id = Guid.NewGuid().ToString();
            }

            return new GenerationResult
            {
                Success = true,
                Integration = integration
            };
        }
        catch (Exception ex)
        {
            return new GenerationResult
            {
                Success = false,
                ErrorMessage = $"Unexpected error: {ex.Message}"
            };
        }
    }

    private static string? ValidateIntegration(Integration integration)
    {
        if (string.IsNullOrWhiteSpace(integration.Name))
        {
            return "The integration is missing a name.";
        }

        if (integration.Requests == null || integration.Requests.Count == 0)
        {
            return "The integration must have at least one request.";
        }

        // Validate each request has required fields
        for (int i = 0; i < integration.Requests.Count; i++)
        {
            var request = integration.Requests[i];
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return $"Request {i + 1} is missing a name.";
            }
            
            if (string.IsNullOrWhiteSpace(request.Url))
            {
                return $"Request '{request.Name}' is missing a URL.";
            }

            if (string.IsNullOrWhiteSpace(request.Method))
            {
                return $"Request '{request.Name}' is missing an HTTP method.";
            }
        }

        return null; // No validation errors
    }

    private static string CleanJsonResponse(string content)
    {
        // Remove common markdown code block markers
        content = content.Trim();

        if (content.StartsWith("```json"))
        {
            content = content[7..]; // Remove ```json
        }
        else if (content.StartsWith("```"))
        {
            content = content[3..]; // Remove ```
        }

        if (content.EndsWith("```"))
        {
            content = content[..^3]; // Remove trailing ```
        }

        // Find the first { and last } to extract just the JSON object
        var firstBrace = content.IndexOf('{');
        var lastBrace = content.LastIndexOf('}');

        if (firstBrace >= 0 && lastBrace > firstBrace)
        {
            content = content[firstBrace..(lastBrace + 1)];
        }

        return content.Trim();
    }
}

public class GenerateIntegrationRequest
{
    public string Prompt { get; set; } = string.Empty;
}

public class GenerationResult
{
    public bool Success { get; set; }
    public Integration? Integration { get; set; }
    public string? ErrorMessage { get; set; }
    public string? RawResponse { get; set; }
}
