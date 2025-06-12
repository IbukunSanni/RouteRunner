namespace ApiRunner.Models
{
    public class ApiRequest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString(); // For JSONPath linking
        public string Method { get; set; } = "GET";
        public string Url { get; set; } = string.Empty;
        public Dictionary<string, string> Headers { get; set; } = new();
        public string? Body { get; set; }

        // Optional: lets you extract values from the response
        public Dictionary<string, string>? Extractors { get; set; }
    }
}
