@echo off
echo.
echo Stopping Code Execution Server...
echo.

docker-compose down

if errorlevel 1 (
    echo Failed to stop services
    pause
    exit /b 1
)

echo Services stopped successfully
echo.
pause
