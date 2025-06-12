using System.Text.Json;

namespace ApiRunner.Helpers
{
    public static class HttpHelpers
    {
        public static string TryPrettyPrintJson(string json)
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

        public static string ApplyPlaceholders(string input, Dictionary<string, string> values)
        {
            foreach (var (key, val) in values)
            {   // TODO: Check if correct
                input = input.Replace($"{{key}}", val);
            }
            return input;
        }
    }
}
