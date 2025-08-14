# Deploying RouteRunner Backend to Kinsta

This guide walks you through deploying your .NET 9 backend to Kinsta's Application Hosting platform.

## Prerequisites

- A Kinsta account with Application Hosting enabled
- Git repository (GitHub, GitLab, or Bitbucket)
- Docker installed locally for testing (optional)

## Pre-Deployment Checklist

- [x] Dockerfile configured for production
- [x] .dockerignore file created
- [x] appsettings.Production.json configured
- [x] Environment variables documented
- [ ] Database connection configured
- [ ] CORS settings updated for production frontend URL

## Step 1: Prepare Your Repository

1. **Push your code to a Git repository:**
   ```bash
   git add .
   git commit -m "Prepare backend for Kinsta deployment"
   git push origin main
   ```

2. **Ensure the following files are in your `backend/ApiRunner` directory:**
   - `Dockerfile` (already configured)
   - `.dockerignore` (already created)
   - `appsettings.Production.json` (already created)
   - Your application code

## Step 2: Test Docker Build Locally (Optional)

Test your Docker configuration locally before deploying:

```bash
cd backend/ApiRunner

# Build the Docker image
docker build -t routerunner-backend .

# Run the container
docker run -p 8080:8080 -e PORT=8080 routerunner-backend

# Test the API
curl http://localhost:8080/api/health
```

## Step 3: Create Kinsta Application

1. **Log in to MyKinsta dashboard**
   - Navigate to Applications > Add application

2. **Connect your Git repository**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Kinsta to access your repository
   - Select your repository and branch (usually `main` or `master`)

3. **Configure build settings:**

   ### Option A: Using Docker (Recommended)
   - **Build path**: `backend/ApiRunner`
   - **Dockerfile path**: `backend/ApiRunner/Dockerfile`
   - **Context**: `backend/ApiRunner`

   ### Option B: Using Nixpacks (Alternative)
   - **Build path**: `backend`
   - Kinsta will auto-detect the nixpacks.toml file
   - No Dockerfile path needed

## Step 4: Configure Environment Variables

In the Kinsta dashboard, add the following environment variables:

### Required Variables:
```
PORT=8080                                    # Kinsta sets this automatically
ASPNETCORE_ENVIRONMENT=Production           # Set to Production
FRONTEND_URL=https://your-frontend-url.com  # Your frontend URL for CORS
```

### Optional Variables (based on your needs):
```
# Database (if using external database)
DATABASE_URL=your-database-connection-string

# Enable Swagger in production (not recommended)
EnableSwagger=false

# Add any API keys or secrets your app needs
JWT_SECRET_KEY=generate-a-secure-key
API_KEY=your-api-key
```

## Step 5: Configure Resources

1. **Choose your pod size:**
   - Start with the smallest size for testing
   - Scale up based on your needs

2. **Set auto-scaling rules (optional):**
   - Min instances: 1
   - Max instances: Based on your budget and expected traffic

## Step 6: Deploy

1. **Click "Create application"**
   - Kinsta will start building your Docker image
   - Monitor the build logs for any errors

2. **Wait for deployment to complete**
   - First deployment may take 5-10 minutes
   - Subsequent deployments are faster due to caching

## Step 7: Verify Deployment

1. **Check application status:**
   - Green status indicates successful deployment

2. **Access your application:**
   - Kinsta provides a URL like: `https://your-app-name.kinsta.app`
   - Test your API endpoints

3. **Check logs:**
   - View runtime logs in Kinsta dashboard
   - Look for any startup errors or warnings

## Step 8: Configure Custom Domain (Optional)

1. **Add custom domain in Kinsta:**
   - Go to Domains tab
   - Add your domain

2. **Update DNS records:**
   - Add CNAME record pointing to Kinsta URL
   - Wait for DNS propagation

3. **Enable SSL:**
   - Kinsta provides free SSL certificates
   - Automatic renewal

## Database Considerations

### Option 1: SQLite (Current - Development only)
- Not recommended for production
- Data will be lost on container restart

### Option 2: Kinsta Database Hosting
- Create a PostgreSQL or MySQL database in Kinsta
- Update connection string in environment variables

### Option 3: External Database
- Use any external database service
- Configure connection via environment variables

**To switch to PostgreSQL:**

1. Update `ApiRunner.csproj`:
   ```xml
   <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.0" />
   ```

2. Update `Program.cs`:
   ```csharp
   builder.Services.AddDbContext<AppDbContext>(options =>
       options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
   ```

3. Set DATABASE_URL environment variable in Kinsta

## Monitoring and Maintenance

### Logs
- Access via Kinsta dashboard
- Download logs for detailed analysis

### Metrics
- Monitor CPU and memory usage
- Set up alerts for high usage

### Updates
- Push changes to your Git repository
- Kinsta automatically rebuilds and deploys

## Troubleshooting

### Common Issues:

1. **Port binding errors:**
   - Ensure your app listens on the PORT environment variable
   - Check Program.cs has: `app.Urls.Add($"http://0.0.0.0:{port}");`

2. **Database connection failures:**
   - Verify connection string in environment variables
   - Check network accessibility between app and database

3. **CORS errors:**
   - Update FRONTEND_URL environment variable
   - Ensure Program.cs includes proper CORS configuration

4. **Build failures:**
   - Check Dockerfile syntax
   - Verify all required files are not in .dockerignore
   - Review build logs in Kinsta dashboard

5. **Memory issues:**
   - Upgrade to larger pod size
   - Optimize your application code
   - Implement caching strategies

## Rollback Procedure

If deployment fails or causes issues:

1. **In Kinsta dashboard:**
   - Go to Deployments tab
   - Click "Rollback" on previous successful deployment

2. **Via Git:**
   - Revert your Git commit
   - Push to trigger new deployment

## Performance Optimization

1. **Enable response compression:**
   ```csharp
   builder.Services.AddResponseCompression();
   app.UseResponseCompression();
   ```

2. **Implement caching:**
   - Use in-memory caching for frequently accessed data
   - Consider Redis for distributed caching

3. **Optimize Docker image:**
   - Multi-stage builds (already implemented)
   - Minimize layers
   - Use Alpine Linux base images if possible

## Security Best Practices

1. **Never commit secrets to Git**
   - Use environment variables for all secrets
   - Use .gitignore to exclude sensitive files

2. **Enable HTTPS only:**
   - Force HTTPS in production
   - Use Kinsta's SSL certificates

3. **Implement rate limiting:**
   ```csharp
   builder.Services.AddRateLimiter(options => {
       options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
           httpContext => RateLimitPartition.GetFixedWindowLimiter(
               partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
               factory: partition => new FixedWindowRateLimiterOptions
               {
                   AutoReplenishment = true,
                   PermitLimit = 100,
                   Window = TimeSpan.FromMinutes(1)
               }));
   });
   ```

4. **Regular updates:**
   - Keep .NET runtime updated
   - Update NuGet packages regularly
   - Monitor security advisories

## Support

- **Kinsta Support:** Available 24/7 via chat
- **Documentation:** https://kinsta.com/docs/application-hosting/
- **Community:** Kinsta Community Forum

## Next Steps

1. Set up monitoring and alerting
2. Configure database for production
3. Implement CI/CD pipeline
4. Add health check endpoints
5. Set up backup strategy

---

Last updated: December 2024
