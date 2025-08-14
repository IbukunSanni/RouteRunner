# Deploying to Fly.io

This guide walks you through deploying your .NET 8 backend to Fly.io.

## Prerequisites

1. **Install Fly CLI**:
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up/Login to Fly.io**:
   ```bash
   fly auth signup  # For new users
   # OR
   fly auth login   # For existing users
   ```

## Step 1: Initialize Fly App

Navigate to your backend directory:
```bash
cd backend/ApiRunner
```

Create a new Fly app:
```bash
fly launch --no-deploy
```

When prompted:
- Choose an app name (or let Fly generate one)
- Select a region close to your users
- Say "No" to PostgreSQL database (unless you need it)
- Say "No" to Redis (unless you need it)

## Step 2: Configure Secrets

Set your environment variables as secrets:
```bash
# Set your frontend URL for CORS
fly secrets set FRONTEND_URL=https://your-frontend-url.com

# Add any API keys or secrets
fly secrets set JWT_SECRET_KEY=your-secret-key-here
fly secrets set API_KEY=your-api-key-here

# Database connection (if using external database)
fly secrets set DATABASE_URL=your-database-connection-string
```

## Step 3: Deploy

Deploy your application:
```bash
fly deploy
```

This will:
1. Build your Docker image
2. Push it to Fly's registry
3. Deploy it to your selected region
4. Start health checks

## Step 4: Verify Deployment

Check your app status:
```bash
fly status
```

Open your app in browser:
```bash
fly open
```

Test the health endpoint:
```bash
curl https://your-app-name.fly.dev/health
```

View logs:
```bash
fly logs
```

## Database Options

### Option 1: Fly Postgres (Recommended for production)
```bash
fly postgres create
fly postgres attach --app your-app-name
```

Then update your connection in code to use the `DATABASE_URL` environment variable.

### Option 2: SQLite with Persistent Volume
```bash
# Create a volume
fly volumes create data --size 1 --region iad

# Update fly.toml to mount the volume
```

Add to fly.toml:
```toml
[mounts]
  source="data"
  destination="/app/data"
```

### Option 3: External Database
Use any external database service and set the connection string as a secret.

## Scaling

### Horizontal Scaling (More instances)
```bash
# Scale to 3 instances
fly scale count 3

# Scale by region
fly scale count iad=2 lax=1
```

### Vertical Scaling (Bigger instances)
```bash
# View available VM sizes
fly scale show

# Scale to 2GB RAM
fly scale vm shared-cpu-2x

# Scale to dedicated CPU
fly scale vm dedicated-cpu-1x
```

### Auto-scaling
Update fly.toml:
```toml
[[services]]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1  # Minimum instances
```

## Custom Domain

1. Add your domain:
```bash
fly certs add yourdomain.com
```

2. Get DNS records:
```bash
fly certs show yourdomain.com
```

3. Add the provided DNS records to your domain provider.

4. Verify:
```bash
fly certs check yourdomain.com
```

## Monitoring

### View metrics:
```bash
fly dashboard metrics
```

### SSH into container:
```bash
fly ssh console
```

### Execute commands in container:
```bash
fly ssh console -C "dotnet --version"
```

## CI/CD with GitHub Actions

Create `.github/workflows/fly-deploy.yml`:
```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: superfly/flyctl-actions/setup-flyctl@master
      
      - run: flyctl deploy --remote-only
        working-directory: ./backend/ApiRunner
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get your API token:
```bash
fly auth token
```

Add it to GitHub Secrets as `FLY_API_TOKEN`.

## Useful Commands

```bash
# View app info
fly info

# List apps
fly apps list

# Restart app
fly apps restart your-app-name

# View releases
fly releases

# Rollback to previous version
fly releases rollback

# Delete app (careful!)
fly apps destroy your-app-name

# View resource usage
fly scale show

# View regions
fly regions list

# Move to different region
fly regions set iad

# View IP addresses
fly ips list
```

## Troubleshooting

### Port Binding Issues
Ensure your app listens on port 8080 and binds to `0.0.0.0`.

### Health Check Failures
- Check `/health` endpoint returns 200 OK
- Increase grace period in fly.toml if needed
- Check logs: `fly logs`

### Memory Issues
Scale up VM size:
```bash
fly scale vm shared-cpu-1x --memory 512
```

### Build Failures
- Check Dockerfile syntax
- Ensure all files are committed to git
- Try building locally: `docker build .`

### Connection Issues
- Check CORS configuration
- Verify environment variables: `fly secrets list`
- Check firewall rules

## Cost Optimization

1. **Use auto-stop/start**: Machines stop when idle
2. **Start small**: Begin with shared-cpu-1x
3. **Use correct regions**: Deploy close to users
4. **Monitor usage**: Check dashboard regularly

## Support

- Documentation: https://fly.io/docs
- Community: https://community.fly.io
- Status: https://status.fly.io

## Next Steps

1. Set up monitoring/alerting
2. Configure database backups
3. Implement CI/CD pipeline
4. Add custom domain
5. Set up log aggregation
