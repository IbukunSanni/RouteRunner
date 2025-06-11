using Microsoft.AspNetCore.Mvc;

namespace ApiRunner.Controllers
{
    [ApiController]
    [Route("/")]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public IActionResult Hello()
        {
            return Ok("Hello, RPG this is me and her Worlds!");
        }
    }
}
