using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ApiRunner.Controllers;
using ApiRunner.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ApiRunner.Tests.Integration
{
    public class IntegrationModificationTests
    {
        [Fact]
        public void CreateIntegration_AddsIntegrationSuccessfully()
        {
            // Arrange
            var controller = new IntegrationsController();
            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.NewGuid(),
                Name = "New Test Integration",
                Requests = new List<ApiRequest>()
            };

            // Act
            var result = controller.Create(integration) as CreatedAtActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(201, result.StatusCode);
            var returned = result.Value as ApiRunner.Models.Integration;
            Assert.NotNull(returned);
            Assert.Equal(integration.Id, returned.Id);
        }

        [Fact]
        public void GetIntegrationById_ReturnsCorrectItem()
        {
            // Arrange
            var controller = new ApiRunner.Controllers.IntegrationsController();
            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.NewGuid(),
                Name = "Lookup Test",
                Requests = new List<ApiRequest>()
            };
            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);

            // Act
            var result = controller.GetById(integration.Id) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            var returned = result.Value as ApiRunner.Models.Integration;
            Assert.Equal("Lookup Test", returned.Name);
        }

        [Fact]
        public void UpdateIntegration_SavesChangesCorrectly()
        {
            // Arrange
            var controller = new IntegrationsController();
            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.NewGuid(),
                Name = "Original Name",
                Requests = new List<ApiRequest>()
            };
            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);

            // Act
            var updated = new ApiRunner.Models.Integration
            {
                Id = integration.Id,
                Name = "Updated Name",
                Requests = new List<ApiRequest>()
            };
            var result = controller.UpdateIntegration(integration.Id, updated) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.Equal("Updated Name", ApiRunner.Data.FakeDatabase.Integrations.First(i => i.Id == integration.Id).Name);
        }

        [Fact]
        public void DeleteIntegration_RemovesFromDatabase()
        {
            // Arrange
            var controller = new IntegrationsController();
            var integration = new ApiRunner.Models.Integration
            {
                Id = Guid.NewGuid(),
                Name = "Delete Test",
                Requests = new List<ApiRequest>()
            };
            ApiRunner.Data.FakeDatabase.Integrations.Add(integration);

            // Act
            var result = controller.DeleteIntegration(integration.Id) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.DoesNotContain(ApiRunner.Data.FakeDatabase.Integrations, i => i.Id == integration.Id);
        }
    }
}
