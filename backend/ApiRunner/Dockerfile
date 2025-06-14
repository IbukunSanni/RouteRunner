# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy everything inside ApiRunner
COPY . . 

# Restore and publish
RUN dotnet restore ApiRunner.csproj
RUN dotnet publish ApiRunner.csproj -c Release -o /app/out

# Stage 2: Run the app
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# The DLL name should match your project (ApiRunner.dll)
ENTRYPOINT ["dotnet", "ApiRunner.dll"]
