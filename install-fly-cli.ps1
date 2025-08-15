# PowerShell script to install Fly CLI on Windows
# Run this in PowerShell (not Git Bash)

Write-Host "Installing Fly CLI for Windows..." -ForegroundColor Green

# Download and run the official Fly.io installer
try {
    iwr https://fly.io/install.ps1 -useb | iex
    Write-Host "Fly CLI installed successfully!" -ForegroundColor Green
    Write-Host "You may need to restart your terminal for the PATH to update." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After restarting, verify installation with: fly version" -ForegroundColor Cyan
} catch {
    Write-Host "Error installing Fly CLI: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Download manually from https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Yellow
}
