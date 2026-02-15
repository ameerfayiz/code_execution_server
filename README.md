# Code Execution Server

A secure, production-ready multi-language code execution platform that allows users to run code in isolated Docker containers.

## Features

- **Multi-Language Support**: Python, JavaScript, Java, C++, Ruby, and Go
- **Secure Execution**: Code runs in isolated Docker containers with resource limits
- **Rate Limiting**: Built-in protection against abuse
- **Queue Management**: Handles concurrent execution requests efficiently
- **Interactive Input**: Supports programs that require user input
- **Production Ready**: Comprehensive logging, error handling, and health checks

## Architecture

- **Backend**: Node.js/Express API server
- **Frontend**: Responsive web interface with CodeMirror editor
- **Execution**: Docker containers for each supported language
- **Orchestration**: Docker Compose for easy deployment

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- 2GB RAM minimum
- Port 3000 available

## Quick Start

### 1. Clone and Navigate

```bash
cd d:\DEVELOPMENT\React\code_execution_server
```

### 2. Configure Environment (Optional)

Copy the example environment file and customize if needed:

```bash
cp .env.example .env
```

Edit `.env` to configure:
- `NODE_ENV`: Set to `production` for production deployment
- `MAX_CONCURRENT_EXECUTIONS`: Maximum simultaneous code executions
- `CORS_ORIGIN`: Allowed origins for CORS (use `*` for all, or specify domains)

### 3. Build Docker Images

```bash
docker-compose build
```

This builds:
- API server with Node.js
- Python execution environment
- JavaScript execution environment
- Java execution environment
- C++ execution environment
- Ruby execution environment
- Go execution environment

### 4. Start the Application

```bash
docker-compose up -d
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Troubleshooting Docker on Windows

If you encounter Docker connectivity issues:

### Option 1: Restart Docker Desktop
1. Right-click Docker Desktop system tray icon
2. Select "Restart"
3. Wait for Docker to fully restart
4. Run `docker-compose up -d` again

### Option 2: Run Server Locally (Development)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

Then open `web-ui/index.html` in your browser.

**Note**: Local development mode requires Docker to be running for code execution.

## API Endpoints

### Execute Code
```http
POST /execute
Content-Type: application/json

{
  "language": "python",
  "code": "print('Hello, World!')",
  "input": "optional input data"
}
```

### Health Check
```http
GET /health
```

### List Supported Languages
```http
GET /languages
```

## Security Features

1. **Container Isolation**: Each execution runs in a fresh, isolated container
2. **Resource Limits**:
   - Memory: 100MB per execution
   - CPU: 1 core maximum
   - Network: Disabled (no external network access)
   - Process limit: 50 processes
3. **Non-Root User**: Code runs as unprivileged user `coderunner`
4. **Security Options**:
   - No new privileges
   - All capabilities dropped
5. **Rate Limiting**: 100 requests per 15 minutes per IP
6. **Input Validation**: Code and input size limits
7. **Execution Timeout**: 10-15 seconds maximum

## Production Deployment

### Docker Compose (Recommended)

The application is configured for production deployment:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

Configure in docker-compose.yml or .env file:

- `NODE_ENV=production` - Production mode
- `PORT=3000` - Server port
- `MAX_CONCURRENT_EXECUTIONS=5` - Concurrent execution limit
- `CORS_ORIGIN=*` - CORS configuration

### Monitoring

#### Health Check
```bash
curl http://localhost:3000/health
```

#### View Logs
```bash
# All services
docker-compose logs -f

# API server only
docker-compose logs -f api-server
```

#### Container Status
```bash
docker-compose ps
```

### Scaling

To increase concurrent executions, update docker-compose.yml:

```yaml
environment:
  - MAX_CONCURRENT_EXECUTIONS=10
```

### Reverse Proxy

For production, use Nginx or Apache as a reverse proxy:

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS

Use Let's Encrypt with Certbot or configure SSL in your reverse proxy.

## Development

### Local Development

```bash
cd server
npm install
npm run dev
```

This runs the server with nodemon for auto-restart on file changes.

### Add New Language Support

1. Create Dockerfile in `languages/<language>/`
2. Add configuration in `server/server.js`:
```javascript
supportedLanguages['<language>'] = {
  image: 'code-execution-<language>:latest',
  fileExtension: '.<ext>',
  command: ['<interpreter>', '/code/script.<ext>']
};
```
3. Add to docker-compose.yml
4. Rebuild: `docker-compose build`

## Maintenance

### Update Dependencies

```bash
cd server
npm update
docker-compose build --no-cache
```

### Clean Up

```bash
# Remove stopped containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Remove unused Docker images
docker image prune -a
```

## Resource Usage

### Per Execution:
- Memory: 100MB limit
- CPU: 1 core (100%)
- Disk: Temporary storage only
- Network: Disabled

### API Server:
- Memory: 1GB limit
- CPU: 1 core limit

## Limitations

- Maximum code size: 50,000 characters
- Maximum input size: 10,000 characters
- Execution timeout: 10-15 seconds
- No network access in execution containers
- No persistent storage between executions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Verify Docker is running: `docker ps`
- Check health endpoint: `curl http://localhost:3000/health`

## Changelog

### Version 1.0.0 (Production Ready)
- Multi-language support (Python, JavaScript, Java, C++, Ruby, Go)
- Docker containerization
- Rate limiting and security features
- Input validation and error handling
- Comprehensive logging
- Health checks
- Queue management
- Interactive input support
