Write-Host "[RouteRunner] Starting development environment with hot reload..." -ForegroundColor Green
Write-Host ""

# Check if .NET is installed
try {
    $dotnetVersion = dotnet --version
    Write-Host "[RouteRunner] .NET SDK version: $dotnetVersion" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] .NET SDK not found! Please install .NET 9 SDK" -ForegroundColor Red
    Write-Host "Download from: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[RouteRunner] Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Node.js not found! Please install Node.js" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[RouteRunner] Prerequisites check passed!" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies if needed
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "[RouteRunner] Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host ""
}

Write-Host "[RouteRunner] Starting backend (.NET API)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend\ApiRunner
    dotnet watch run --urls=http://localhost:5088
}

Start-Sleep 3

Write-Host "[RouteRunner] Starting frontend (React + Vite)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5088" -ForegroundColor Cyan
Write-Host "Swagger:  http://localhost:5088/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Yellow
Write-Host ""

try {
    Set-Location frontend
    npm run dev -- --host 0.0.0.0 --port 3000
} finally {
    Write-Host ""
    Write-Host "[RouteRunner] Stopping backend service..." -ForegroundColor Yellow
    Stop-Job $backendJob -PassThru | Remove-Job
    Write-Host "[RouteRunner] Development environment stopped." -ForegroundColor Green
}