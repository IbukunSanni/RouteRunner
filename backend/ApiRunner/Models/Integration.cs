namespace ApiRunner.Models
{
    public class Integration
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;

        public List<ApiRequest> Requests { get; set; } = new();
    }

}



