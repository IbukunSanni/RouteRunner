# RouteRunner Backend Deployment Guide

This guide covers deployment options for the RouteRunner .NET 9 backend.

## Prerequisites
- Docker installed locally
- Git repository (GitHub, GitLab, or Bitbucket)
- Configured `Dockerfile` and `.dockerignore` (already included)

## Quick Test Locally
```bash
cd backend/ApiRunner
docker build -t routerunner-backend .
docker run -p 8080:8080 -e PORT=8080 routerunner-backend
curl http://localhost:8080/api/health
```

## Deployment Options

### Option 1: Fly.io (Recommended for simplicity)

1. **Install Fly CLI**: https://fly.io/docs/hands-on/install-flyctl/
2. **Login**: `fly auth login`
3. **Deploy**:
   ```bash
   cd backend/ApiRunner
   fly launch --no-deploy
   fly deploy
   ```
4. **Set secrets**:
   ```bash
   fly secrets set FRONTEND_URL=https://your-frontend-url.com
   ```

### Option 2: Kinsta Application Hosting

1. **Connect Git repository** in Kinsta dashboard
2. **Configure**:
   - Build path: `backend/ApiRunner` 
   - Dockerfile path: `backend/ApiRunner/Dockerfile`
3. **Set environment variables**:
   - `PORT=8080`
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `FRONTEND_URL=https://your-frontend-url.com`

### Option 3: Docker Deployment (Any platform)

Build and push to your preferred container registry:
```bash
docker build -t your-registry/routerunner-backend .
docker push your-registry/routerunner-backend
```

## Environment Variables
```
PORT=8080                                    # Required
ASPNETCORE_ENVIRONMENT=Production           # Required
FRONTEND_URL=https://your-frontend-url.com  # Required for CORS
```

## Database Options
- **Development**: SQLite (current)
- **Production**: PostgreSQL, MySQL, or any external database
- Set `DATABASE_URL` environment variable for external databases

## Health Check
All platforms should check: `GET /api/health`

## Troubleshooting
- **Port issues**: Ensure app binds to `0.0.0.0:$PORT`
- **CORS errors**: Verify `FRONTEND_URL` environment variable
- **Build failures**: Check Dockerfile and .dockerignore

For detailed platform-specific instructions, refer to:
- [Fly.io Docs](https://fly.io/docs)
- [Kinsta Docs](https://kinsta.com/docs/application-hosting/)