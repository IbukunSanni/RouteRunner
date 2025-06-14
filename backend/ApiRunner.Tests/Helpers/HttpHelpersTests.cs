using ApiRunner.Helpers;
using System.Text.Json;
using Xunit;
using System.Collections.Generic;

namespace ApiRunner.Tests.Helpers
{
    public class HttpHelpersTests
    {
        [Fact]
        public void ApplyPlaceholders_ReplacesMultipleCorrectly()
        {
            var template = "https://api.com/users/{{userId}}/posts/{{postId}}";
            var values = new Dictionary<string, string>
            {
                ["userId"] = "42",
                ["postId"] = "123"
            };

            var result = HttpHelpers.ApplyPlaceholders(template, values);

            Assert.Equal("https://api.com/users/42/posts/123", result);
        }

        [Fact]
        public void ApplyPlaceholders_LeavesUnmatchedTokens()
        {
            var result = HttpHelpers.ApplyPlaceholders("Hello {{name}}", new());
            Assert.Equal("Hello {{name}}", result);
        }

        [Fact]
        public void ExtractValuesFromResponse_ValidPaths_StoresExpectedValues()
        {
            // Arrange
            var response = """
            {
                "id": 101,
                "user": {
                    "name": "Ibukun",
                    "email": "test@example.com"
                }
            }
            """;

            var extractors = new Dictionary<string, string>
            {
                ["userId"] = "$.id",
                ["username"] = "$.user.name"
            };

            var values = new Dictionary<string, string>();

            // Act
            HttpHelpers.ExtractValuesFromResponse(response, extractors, values);

            // Assert
            Assert.Equal("101", values["userId"]);
            Assert.Equal("Ibukun", values["username"]);
        }

        [Fact]
        public void ExtractValuesFromResponse_InvalidPath_DoesNotCrash()
        {
            var response = "{ \"id\": 1 }";
            var extractors = new Dictionary<string, string>
            {
                ["broken"] = "$.missing.path"
            };
            var values = new Dictionary<string, string>();

            var exception = Record.Exception(() =>
                HttpHelpers.ExtractValuesFromResponse(response, extractors, values));

            Assert.Null(exception); // should fail silently or catch error
            Assert.False(values.ContainsKey("broken"));
        }

    }
}
