# Development stage - for hot reload
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development
WORKDIR /src
EXPOSE 5088

# Install dotnet tools
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

# Copy project file and restore dependencies
COPY ApiRunner.csproj .
RUN dotnet restore ApiRunner.csproj

# Default command for development (will be overridden by docker-compose)
CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5088"]

# Production build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ApiRunner.csproj .
RUN dotnet restore ApiRunner.csproj

# Copy everything else and build
COPY . .
RUN dotnet publish ApiRunner.csproj -c Release -o /app/out --no-restore

# Production runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published output from build stage
COPY --from=build /app/out .

# Expose port (Kinsta will use the PORT environment variable)
EXPOSE 8080

# Set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production

# The DLL name should match your project (ApiRunner.dll)
ENTRYPOINT ["dotnet", "ApiRunner.dll"]
