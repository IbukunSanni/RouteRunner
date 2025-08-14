@echo off
echo [RouteRunner] Stopping development servers...

REM Kill processes running on ports 3000 and 5088
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Stopping frontend server (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5088') do (
    echo Stopping backend server (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

echo [RouteRunner] Development servers stopped!
pause