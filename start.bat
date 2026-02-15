@echo off
echo.
echo Starting Code Execution Server...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Build images
echo Building Docker images...
docker-compose build
if errorlevel 1 (
    echo Failed to build Docker images
    pause
    exit /b 1
)

echo Docker images built successfully
echo.

REM Start services
echo Starting services...
docker-compose up -d
if errorlevel 1 (
    echo Failed to start services
    pause
    exit /b 1
)

echo Services started successfully
echo.

REM Wait for server
echo Waiting for server to be ready...
timeout /t 5 /nobreak >nul

echo.
echo Application is running!
echo Access the application at: http://localhost:3000
echo.
echo Useful commands:
echo   - View logs: docker-compose logs -f
echo   - Stop server: docker-compose down
echo   - Restart: docker-compose restart
echo.
pause
