@echo off
echo [RouteRunner] Starting development environment with hot reload...
echo.

REM Check if .NET is installed
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] .NET SDK not found! Please install .NET 9 SDK
    echo Download from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [RouteRunner] Prerequisites check passed!
echo.

REM Install frontend dependencies if needed
if not exist "ui\node_modules" (
    echo [RouteRunner] Installing frontend dependencies...
    cd ui
    npm install
    cd ..
    echo.
)

echo [RouteRunner] Starting backend (.NET API) with hot reload on http://localhost:5088...
start "RouteRunner Backend" cmd /k "cd backend\ApiRunner && dotnet watch run --urls=http://localhost:5088"

timeout /t 3 /nobreak >nul

echo [RouteRunner] Starting frontend (React + Vite) on http://localhost:3000...
start "RouteRunner Frontend" cmd /k "cd ui && npm run dev -- --host 0.0.0.0 --port 3000"

timeout /t 2 /nobreak >nul

echo.
echo [RouteRunner] Development environment started!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5088
echo Swagger:  http://localhost:5088/swagger
echo.
echo Both services are running with hot reload enabled.
echo Make changes to your code and see them reflected immediately!
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000

echo.
echo To stop the development servers, close both terminal windows or press Ctrl+C in each.