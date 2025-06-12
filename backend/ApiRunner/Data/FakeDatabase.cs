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
                // 1. Simple Fetch Requests
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

                // 2. Basic Create Post
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
                },

                // 3. Simulated Auth Flow
                new Integration
                {
                    Name = "User Auth + Profile + Posts",
                    Requests = new List<ApiRequest>
                    {
                        new ApiRequest
                        {
                            Id = "login",
                            Method = "POST",
                            Url = "https://example.com/api/auth",
                            Headers = new Dictionary<string, string>
                            {
                                { "Content-Type", "application/json" }
                            },
                            Body = "{ \"username\": \"sora\", \"password\": \"kingdom123\" }",
                            Extractors = new Dictionary<string, string>
                            {
                                { "token", "$.accessToken" }
                            }
                        },
                        new ApiRequest
                        {
                            Id = "getProfile",
                            Method = "GET",
                            Url = "https://example.com/api/users/me",
                            Headers = new Dictionary<string, string>
                            {
                                { "Authorization", "Bearer {{token}}" }
                            },
                            Body = null,
                            Extractors = new Dictionary<string, string>
                            {
                                { "userId", "$.id" }
                            }
                        },
                        new ApiRequest
                        {
                            Id = "getPosts",
                            Method = "GET",
                            Url = "https://example.com/api/users/{{userId}}/posts",
                            Headers = new Dictionary<string, string>
                            {
                                { "Authorization", "Bearer {{token}}" }
                            },
                            Body = null
                        }
                    }
                },

                // 4. Multi-Step POST + Comments
                new Integration
                {
                    Name = "Multi-Step Commenter",
                    Requests = new List<ApiRequest>
                    {
                        new ApiRequest
                        {
                            Id = "createPost",
                            Method = "POST",
                            Url = "https://jsonplaceholder.typicode.com/posts",
                            Headers = new Dictionary<string, string>
                            {
                                { "Content-Type", "application/json" }
                            },
                            Body = "{ \"title\": \"New Adventures\", \"body\": \"Off to Destiny Islands!\", \"userId\": 2 }",
                            Extractors = new Dictionary<string, string>
                            {
                                { "postId", "$.id" }
                            }
                        },
                        new ApiRequest
                        {
                            Id = "addComment1",
                            Method = "POST",
                            Url = "https://jsonplaceholder.typicode.com/posts/{{postId}}/comments",
                            Headers = new Dictionary<string, string>
                            {
                                { "Content-Type", "application/json" }
                            },
                            Body = "{ \"name\": \"Riku\", \"email\": \"riku@kh.com\", \"body\": \"Don't get lost.\" }"
                        },
                        new ApiRequest
                        {
                            Id = "addComment2",
                            Method = "POST",
                            Url = "https://jsonplaceholder.typicode.com/posts/{{postId}}/comments",
                            Headers = new Dictionary<string, string>
                            {
                                { "Content-Type", "application/json" }
                            },
                            Body = "{ \"name\": \"Kairi\", \"email\": \"kairi@kh.com\", \"body\": \"Come back soon!\" }"
                        },
                        new ApiRequest
                        {
                            Id = "verifyPost",
                            Method = "GET",
                            Url = "https://jsonplaceholder.typicode.com/posts/{{postId}}",
                            Headers = new Dictionary<string, string>(),
                            Body = null
                        }
                    }
                },

                // 5. Public Info Chain with Extractors
                new Integration
                {
                    Name = "Public Info Chain",
                    Requests = new List<ApiRequest>
                    {
                        new ApiRequest
                        {
                            Id = "getUser",
                            Method = "GET",
                            Url = "https://jsonplaceholder.typicode.com/users/1",
                            Headers = new Dictionary<string, string>(),
                            Body = null,
                            Extractors = new Dictionary<string, string>
                            {
                                { "username", "$.username" },
                                { "email", "$.email" }
                            }
                        },
                        new ApiRequest
                        {
                            Id = "getTodos",
                            Method = "GET",
                            Url = "https://jsonplaceholder.typicode.com/users/1/todos",
                            Headers = new Dictionary<string, string>(),
                            Body = null
                        },
                        new ApiRequest
                        {
                            Id = "getPosts",
                            Method = "GET",
                            Url = "https://jsonplaceholder.typicode.com/users/1/posts",
                            Headers = new Dictionary<string, string>(),
                            Body = null
                        }
                    }
                }
            };
        }
    }
}
