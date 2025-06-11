using Microsoft.AspNetCore.Mvc;
using ApiRunner.Models;
using ApiRunner.Data;

namespace ApiRunner.Controllers
{
    [ApiController]
    [Route("/integrations")]
    public class IntegrationsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(FakeDatabase.Integrations);
        }

        [HttpPost]
        public IActionResult Create(Integration integration)
        {
            FakeDatabase.Integrations.Add(integration);
            return CreatedAtAction(nameof(GetAll), new { id = integration.Id }, integration);
        }
    }
}
