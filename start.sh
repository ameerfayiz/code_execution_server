#!/bin/bash

echo "🚀 Starting Code Execution Server..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build images if needed
echo "📦 Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker images"
    exit 1
fi

echo "✅ Docker images built successfully"
echo ""

# Start services
echo "🔧 Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services"
    exit 1
fi

echo "✅ Services started successfully"
echo ""

# Wait for health check
echo "⏳ Waiting for server to be ready..."
sleep 5

# Check health
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Server is healthy and ready!"
        echo ""
        echo "🎉 Application is running!"
        echo "📍 Access the application at: http://localhost:3000"
        echo ""
        echo "Useful commands:"
        echo "  - View logs: docker-compose logs -f"
        echo "  - Stop server: docker-compose down"
        echo "  - Restart: docker-compose restart"
        exit 0
    fi
    sleep 2
done

echo "⚠️  Server started but health check failed"
echo "Check logs with: docker-compose logs -f"
echo ""
echo "Application should be available at: http://localhost:3000"
