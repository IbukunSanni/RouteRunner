namespace ApiRunner.Models
{
    public class RunResult
    {
        public string Url { get; set; } = string.Empty;
        public string Method { get; set; } = "GET";
        public int StatusCode { get; set; }
        public long DurationMs { get; set; }
        public string ResponseBody { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
    }
}
