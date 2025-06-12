public class ApiRequest
{
    public string Id { get; set; } = Guid.NewGuid().ToString(); // backend logic
    public string Name { get; set; } = string.Empty;             // UI/UX label
    public string Method { get; set; } = "GET";
    public string Url { get; set; } = string.Empty;
    public Dictionary<string, string> Headers { get; set; } = new();
    public string? Body { get; set; }
    public Dictionary<string, string>? Extractors { get; set; }
}
