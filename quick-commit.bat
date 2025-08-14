@echo off
if "%~1"=="" (
    echo Usage: quick-commit.bat "Your commit message"
    echo Example: quick-commit.bat "Add new API endpoint for integrations"
    echo Example: quick-commit.bat "Fix frontend routing issue"
    exit /b 1
)

echo [RouteRunner] Adding all changes...
git add .

echo [RouteRunner] Committing with message: %~1
git commit -m "%~1"

if %errorlevel% neq 0 (
    echo [ERROR] Commit failed!
    exit /b 1
)

echo [RouteRunner] Pushing to remote...
git push

if %errorlevel% neq 0 (
    echo [ERROR] Push failed!
    exit /b 1
)

echo [RouteRunner] Successfully committed and pushed!