using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using ApiRunner.Models;
using System.Text.Json;

namespace ApiRunner.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<Integration>> GenerateIntegration([FromBody] GenerateIntegrationRequest request)
    {
        try
        {
            _logger.LogInformation("Generating integration from prompt: {Prompt}", request.Prompt);

            var systemPrompt = @"You are an API integration generator. Convert natural language descriptions into JSON integration objects.

Return ONLY valid JSON in this exact format:
{
  ""name"": ""Integration Name"",
  ""requests"": [
    {
      ""id"": ""uniqueId"",
      ""name"": ""Request Name"",
      ""method"": ""GET|POST|PUT|DELETE"",
      ""url"": ""https://api.example.com/endpoint"",
      ""headers"": {
        ""Content-Type"": ""application/json""
      },
      ""body"": ""{\""key\"": \""value\""}"",
      ""extractors"": {
        ""variableName"": ""$.jsonPath""
      }
    }
  ]
}

Rules:
- Use realistic API endpoints (JSONPlaceholder, httpbin.org, etc.)
- Include proper headers
- Add extractors for chaining requests (use JSONPath like $.id, $.data.token)
- Use placeholders like {{userId}} for extracted values
- Keep it simple but functional";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(request.Prompt)
            };

            var response = await _chatClient.CompleteChatAsync(messages);
            var content = response.Value.Content[0].Text;

            _logger.LogInformation("LLM Response: {Response}", content);

            // Parse the JSON response
            var integration = JsonSerializer.Deserialize<Integration>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (integration == null)
            {
                return BadRequest("Failed to generate valid integration");
            }

            // Assign IDs if missing
            integration.Id = Guid.NewGuid();
            foreach (var req in integration.Requests)
            {
                if (string.IsNullOrEmpty(req.Id))
                {
                    req.Id = Guid.NewGuid().ToString();
                }
            }

            return Ok(integration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating integration");
            return StatusCode(500, "Failed to generate integration");
        }
    }
}

public class GenerateIntegrationRequest
{
    public string Prompt { get; set; } = string.Empty;
}