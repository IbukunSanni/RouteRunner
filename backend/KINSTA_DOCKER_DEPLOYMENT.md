# Kinsta Deployment Using Docker (Recommended)

## Quick Setup Guide

Since nixpacks has issues with .NET 8, we'll use Docker which is more reliable.

## Step 1: Verify Files

Ensure these files exist in `backend/ApiRunner/`:
- ✅ `Dockerfile` 
- ✅ `.dockerignore`
- ✅ `appsettings.Production.json`
- ✅ `ApiRunner.csproj` (using .NET 8)

## Step 2: Push to GitHub

```bash
git add .
git commit -m "Remove nixpacks, use Docker for Kinsta deployment"
git push origin main
```

## Step 3: Configure Kinsta

In your Kinsta dashboard:

1. **Add New Application**
2. **Connect GitHub Repository**
3. **Configure Build Settings:**

   ```
   Build environment: Use Dockerfile
   Dockerfile path: backend/ApiRunner/Dockerfile
   Context: backend/ApiRunner
   ```

   ⚠️ **IMPORTANT**: Make sure to set the context to `backend/ApiRunner`

## Step 4: Set Environment Variables

In Kinsta Dashboard > Environment Variables, add:

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${PORT}
FRONTEND_URL=https://your-frontend-url.com
EnableSwagger=false
```

## Step 5: Deploy

Click "Deploy Application" and monitor the build logs.

## Verification

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-app.kinsta.app/health

# API test (adjust based on your endpoints)
curl https://your-app.kinsta.app/api/your-endpoint
```

## Troubleshooting

### If Build Fails:

1. **Check Dockerfile path** - Must be `backend/ApiRunner/Dockerfile`
2. **Check Context** - Must be `backend/ApiRunner`
3. **Review build logs** in Kinsta dashboard

### Common Fixes:

- If port binding fails, ensure `Program.cs` has:
  ```csharp
  var port = Environment.GetEnvironmentVariable("PORT") ?? "5088";
  app.Urls.Add($"http://0.0.0.0:{port}");
  ```

- If CORS fails, check `FRONTEND_URL` environment variable

## Why Docker over Nixpacks?

- ✅ Full control over .NET version
- ✅ Reliable and predictable builds
- ✅ Better caching
- ✅ Works with .NET 8 LTS
- ✅ Easier debugging

## Need Help?

Contact Kinsta support with your build logs if issues persist.
