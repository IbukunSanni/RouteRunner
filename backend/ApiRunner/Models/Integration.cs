namespace ApiRunner.Models
{
    public class Integration
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;

        public List<ApiRequest> Requests { get; set; } = new();
    }

    public class ApiRequest
    {
        public string Method { get; set; } = "GET";
        public string Url { get; set; } = "";
        public Dictionary<string, string> Headers { get; set; } = new();
        public string? Body { get; set; } = null;
    }
}
