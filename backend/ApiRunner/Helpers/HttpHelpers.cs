using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ApiRunner.Helpers
{
    public static class HttpHelpers
    {
        /// <summary>
        /// Pretty prints a JSON string, or returns the original if it's invalid.
        /// </summary>
        public static string TryPrettyPrintJson(string json)
        {
            try
            {
                var parsed = JToken.Parse(json);
                return parsed.ToString(Formatting.Indented);
            }
            catch
            {
                return json;
            }
        }

        /// <summary>
        /// Replaces {{placeholders}} in a string using:
        /// 1. Manual values from a dictionary.
        /// 2. JSONPath expressions like {{$.user.id}} from a JObject.
        /// </summary>
        public static string ApplyPlaceholders(string input, Dictionary<string, string> values, JObject? previousResponse = null)
        {
            if (string.IsNullOrWhiteSpace(input)) return input;

            return Regex.Replace(input, @"\{\{(.+?)\}\}", match =>
            {
                var key = match.Groups[1].Value;

                // JSONPath placeholder
                if (key.StartsWith("$.") && previousResponse != null)
                {
                    try
                    {
                        var token = previousResponse.SelectToken(key);
                        return token?.ToString() ?? match.Value;
                    }
                    catch
                    {
                        return match.Value;
                    }
                }

                // Manual map placeholder
                return values.TryGetValue(key, out var val) ? val : match.Value;
            });
        }

        /// <summary>
        /// Extracts values using JSONPath from a JSON body and stores them in the given dictionary.
        /// </summary>
        public static void ExtractValuesFromResponse(string body, Dictionary<string, string> extractors, Dictionary<string, string> values)
        {
            if (string.IsNullOrWhiteSpace(body) || extractors == null || extractors.Count == 0)
                return;

            try
            {
                var json = JObject.Parse(body);

                foreach (var (key, path) in extractors)
                {
                    var token = json.SelectToken(path);
                    if (token != null && token.Type != JTokenType.Null)
                    {
                        values[key] = token.ToString();
                    }
                }
            }
            catch (JsonReaderException ex)
            {
                Console.WriteLine($"Failed to parse response body: {ex.Message}");
            }
        }
    }
}
