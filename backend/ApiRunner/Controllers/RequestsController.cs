using Microsoft.AspNetCore.Mvc;
using ApiRunner.Models;
using ApiRunner.Data;

namespace ApiRunner.Controllers
{
    [ApiController]
    [Route("integrations/{integrationId}/requests")]
    public class RequestsController : ControllerBase
    {
        [HttpPost]
        public IActionResult Add(Guid integrationId, [FromBody] ApiRequest newRequest)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == integrationId);
            if (integration == null) return NotFound();

            newRequest.Id ??= Guid.NewGuid().ToString();
            integration.Requests.Add(newRequest);

            return Ok(newRequest);
        }
        
        [HttpGet]
        public IActionResult GetAll(Guid integrationId)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == integrationId);
            if (integration == null) return NotFound();

            return Ok(integration.Requests);
        }

        [HttpGet("{requestId}")]
        public IActionResult GetById(Guid integrationId, string requestId)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == integrationId);
            if (integration == null) return NotFound();

            var request = integration.Requests.FirstOrDefault(r => r.Id == requestId);
            return request == null ? NotFound() : Ok(request);
        }

        

        [HttpPut("{requestId}")]
        public IActionResult Update(Guid integrationId, string requestId, [FromBody] ApiRequest updated)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == integrationId);
            if (integration == null) return NotFound();

            var index = integration.Requests.FindIndex(r => r.Id == requestId);
            if (index == -1) return NotFound();

            updated.Id = requestId;
            integration.Requests[index] = updated;

            return Ok(updated);
        }

        [HttpDelete("{requestId}")]
        public IActionResult Delete(Guid integrationId, string requestId)
        {
            var integration = FakeDatabase.Integrations.FirstOrDefault(i => i.Id == integrationId);
            if (integration == null) return NotFound();

            var removed = integration.Requests.RemoveAll(r => r.Id == requestId);
            return removed > 0 ? NoContent() : NotFound();
        }
    }
}
