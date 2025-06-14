using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using ApiRunner.Models;
using ApiRunner.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace ApiRunner.Tests.Integration
{
    public class RunIntegrationTests
    {
        [Fact]
        public async Task RunIntegration_ReturnsResults_WithExtractedValues()
        {
            // Arrange
            var controller = new IntegrationsController();
            var id = Guid.NewGuid();

            var integration = new ApiRunner.Models.Integration
            {
                Id = id,
                Name = "Test Chain",
                Requests = new List<ApiRequest>
                {
                    new ApiRequest
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Get Post",
                        Method = "GET",
                        Url = "https://jsonplaceholder.typicode.com/posts/1",
                        Headers = new Dictionary<string, string>(),
                        Extractors = new Dictionary<string, string>
                        {
                            ["userId"] = "$.userId"
                        }
                    },
                    new ApiRequest
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Get User",
                        Method = "GET",
                        Url = "https://jsonplaceholder.typicode.com/users/{{userId}}",
                        Headers = new Dictionary<string, string>(),
                        Extractors = new Dictionary<string, string>
                        {
                            ["username"] = "$.username"
                        }
                    }
                }
            };

            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);

            var runRequest = new IntegrationsController.RunRequest
            {
                Values = new Dictionary<string, string>()
            };

            // Act
            var result = await controller.RunIntegration(id, runRequest) as OkObjectResult;
            var runResults = result?.Value as List<RunResult>;

            // Assert
            Assert.NotNull(runResults);
            Assert.Equal(2, runResults.Count);
            Assert.True(runResults[0].IsSuccess);
            Assert.True(runResults[1].IsSuccess);
            Assert.Equal(200, runResults[0].StatusCode);
            Assert.Contains("userId", runRequest.Values.Keys);
            Assert.Contains("username", runRequest.Values.Keys);
        }

        [Fact]
        public async Task RunIntegration_WithFrontendValues_ReplacesTokensSuccessfully()
        {
            // Arrange
            var controller = new IntegrationsController();
            var id = Guid.NewGuid().ToString();

            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.Parse(id),
                Name = "Runtime Value Test",
                Requests = new List<ApiRequest>
                {
                    new ApiRequest
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Fetch Post By ID",
                        Method = "GET",
                        Url = "https://jsonplaceholder.typicode.com/posts/{{postId}}",
                        Headers = new Dictionary<string, string>(),
                        Extractors = new Dictionary<string, string>
                        {
                            ["title"] = "$.title"
                        }
                    }
                }
            };

            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);

            var runRequest = new IntegrationsController.RunRequest
            {
                Values = new Dictionary<string, string>
                {
                    ["postId"] = "1"
                }
            };

            // Act
            var result = await controller.RunIntegration(Guid.Parse(id), runRequest) as OkObjectResult;
            var runResults = result?.Value as List<RunResult>;

            // Assert
            Assert.NotNull(runResults);
            Assert.Single(runResults);
            Assert.True(runResults[0].IsSuccess);
            Assert.Equal(200, runResults[0].StatusCode);
            Assert.Contains("title", runRequest.Values.Keys);
        }

        [Fact]
        public async Task RunIntegration_Extractor_WithInvalidJsonPath_IsSkipped()
        {
            // Arrange
            var controller = new IntegrationsController();
            var id = Guid.NewGuid().ToString();

            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.Parse(id),
                Name = "Invalid Extractor Test",
                Requests = new List<ApiRequest>
                {
                    new ApiRequest
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Bad Extract",
                        Method = "GET",
                        Url = "https://jsonplaceholder.typicode.com/posts/1",
                        Headers = new Dictionary<string, string>(),
                        Extractors = new Dictionary<string, string>
                        {
                            ["broken"] = "$.non.existent.path"
                        }
                    }
                }
            };

            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);

            var runRequest = new IntegrationsController.RunRequest
            {
                Values = new Dictionary<string, string>()
            };

            // Act
            var result = await controller.RunIntegration(Guid.Parse(id), runRequest) as OkObjectResult;
            var runResults = result?.Value as List<RunResult>;

            // Assert
            Assert.NotNull(runResults);
            Assert.Single(runResults);
            Assert.True(runResults[0].IsSuccess);
            Assert.DoesNotContain("broken", runRequest.Values.Keys);
        }

        [Fact]
        public async Task InvalidJsonBody_ReportsError()
        {
            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.NewGuid(),
                Name = "Bad JSON",
                Requests = new List<ApiRequest>
                 {
            new()
            {
                Id = "1",
                Method = "POST",
                Url = "https://postman-echo.com/post",
                Body = "{ invalid json",
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                }
            }
                }
            };
            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);
            var controller = new IntegrationsController();

            var result = await controller.RunIntegration(integration.Id, new());

            var runResults = Assert.IsType<OkObjectResult>(result).Value as List<RunResult>;
            Assert.NotNull(runResults);
            Assert.Contains(runResults, r => !r.IsSuccess && r.ResponseBody.Contains("Error"));
        }


    }
}
