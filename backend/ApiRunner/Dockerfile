# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ApiRunner.csproj .
RUN dotnet restore ApiRunner.csproj

# Copy everything else and build
COPY . .
RUN dotnet publish ApiRunner.csproj -c Release -o /app/out --no-restore

# Stage 2: Run the app
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
