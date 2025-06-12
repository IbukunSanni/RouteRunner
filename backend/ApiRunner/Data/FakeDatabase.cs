using ApiRunner.Models;

namespace ApiRunner.Data
{
    public static class FakeDatabase
    {
        public static List<Integration> Integrations { get; set; }

        static FakeDatabase()
        {
            Integrations = new List<Integration>
            {
                new Integration
                {
                    Name = "Fetch Posts",
                    Requests = new List<ApiRequest>
                    {
                        new ApiRequest
                        {
                            Method = "GET",
                            Url = "https://jsonplaceholder.typicode.com/posts/1",
                            Headers = new Dictionary<string, string>(),
                            Body = null
                        },
                        new ApiRequest
                        {
                            Method = "GET",
                            Url = "https://jsonplaceholder.typicode.com/posts/2",
                            Headers = new Dictionary<string, string>(),
                            Body = null
                        }
                    }
                },
                new Integration
                {
                    Name = "Create Post",
                    Requests = new List<ApiRequest>
                    {
                        new ApiRequest
                        {
                            Method = "POST",
                            Url = "https://jsonplaceholder.typicode.com/posts",
                            Headers = new Dictionary<string, string>
                            {
                                { "Content-Type", "application/json" }
                            },
                            Body = "{ \"title\": \"foo\", \"body\": \"bar\", \"userId\": 1 }"
                        }
                    }
                }
            };
        }
    }
}
