# Production Deployment Guide

## ✅ Production Readiness Checklist

Your code execution server is now **production-ready** with the following improvements:

### 🔒 Security Enhancements
- ✅ Input validation with size limits (50KB code, 10KB input)
- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ Container security: non-root users, no privileges, capabilities dropped
- ✅ Network isolation (no external network access in containers)
- ✅ Resource limits (100MB RAM, 1 CPU core per execution)
- ✅ Execution timeouts (10-15 seconds)
- ✅ Process limits (50 max processes per container)

### 📊 Monitoring & Logging
- ✅ Comprehensive request/response logging with timestamps
- ✅ Health check endpoint with Docker healthcheck
- ✅ Queue status monitoring
- ✅ Execution tracking with unique IDs
- ✅ Error logging and stack traces

### ⚙️ Configuration
- ✅ Environment-based configuration (.env support)
- ✅ Configurable CORS origins
- ✅ Adjustable concurrent execution limits
- ✅ Production/development mode switching

### 🚀 Deployment
- ✅ Docker Compose orchestration
- ✅ Multi-language support (Python, JavaScript, Java, C++, Ruby, Go)
- ✅ Frontend served from backend (single origin)
- ✅ Health checks for container monitoring
- ✅ Auto-restart on failure
- ✅ Graceful shutdown handling

### 📝 Documentation
- ✅ Comprehensive README with setup instructions
- ✅ API documentation
- ✅ Troubleshooting guide
- ✅ Startup/shutdown scripts

## 🎯 Quick Start

### Start the Application

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manual:**
```bash
docker-compose up -d
```

### Access the Application

Open your browser:
```
http://localhost:3000
```

### Stop the Application

**Windows:**
```cmd
stop.bat
```

**Linux/Mac:**
```bash
./stop.sh
```

**Manual:**
```bash
docker-compose down
```

## 🧪 Testing

### Test the Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"UP"}
```

### Test Code Execution

**Python:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello, World!\")"
  }'
```

**JavaScript:**
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "console.log(\"Hello, World!\")"
  }'
```

### List Supported Languages
```bash
curl http://localhost:3000/languages
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# API server only
docker-compose logs -f api-server

# Last 100 lines
docker-compose logs --tail=100 api-server
```

### Check Container Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

## 🔧 Configuration

### Environment Variables

Edit `.env` or `docker-compose.yml`:

```env
NODE_ENV=production              # production or development
PORT=3000                        # Server port
MAX_CONCURRENT_EXECUTIONS=5      # Concurrent execution limit
CORS_ORIGIN=*                    # CORS allowed origins
```

### Scaling

To handle more concurrent requests, increase the limit:

```yaml
environment:
  - MAX_CONCURRENT_EXECUTIONS=10
```

Then restart:
```bash
docker-compose restart api-server
```

## 🌐 Production Deployment

### With Reverse Proxy (Recommended)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for code execution
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
    }
}
```

### SSL/TLS Setup

Using Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Only allow local access to application port
sudo ufw deny 3000/tcp
```

### Systemd Service (Optional)

Create `/etc/systemd/system/code-execution.service`:

```ini
[Unit]
Description=Code Execution Server
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/code_execution_server
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable code-execution
sudo systemctl start code-execution
```

## 🔍 Troubleshooting

### Application Not Starting

1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Check logs:
   ```bash
   docker-compose logs api-server
   ```

3. Verify port availability:
   ```bash
   netstat -an | grep 3000
   ```

### Code Execution Failing

1. Check language container:
   ```bash
   docker-compose ps
   ```

2. View execution logs:
   ```bash
   docker-compose logs -f api-server
   ```

3. Test Docker socket access:
   ```bash
   docker run hello-world
   ```

### High Memory Usage

1. Check container stats:
   ```bash
   docker stats
   ```

2. Reduce concurrent executions in `.env`:
   ```env
   MAX_CONCURRENT_EXECUTIONS=3
   ```

3. Restart service:
   ```bash
   docker-compose restart api-server
   ```

## 🛡️ Security Best Practices

1. **Change CORS Origin** in production:
   ```yaml
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Use HTTPS** with reverse proxy

3. **Rate Limiting** is enabled by default (100 req/15min)

4. **Monitor Logs** regularly for suspicious activity

5. **Update Dependencies** regularly:
   ```bash
   cd server
   npm update
   docker-compose build --no-cache
   ```

6. **Backup Configuration** and custom code

## 📈 Performance Optimization

### Container Resource Limits

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'      # Increase CPU
      memory: 2G     # Increase memory
```

### Build Optimization

Use BuildKit:
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

## 🔄 Updates & Maintenance

### Update Application

1. Pull latest changes:
   ```bash
   git pull
   ```

2. Rebuild containers:
   ```bash
   docker-compose build --no-cache
   ```

3. Restart services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Clean Up

Remove old images:
```bash
docker image prune -a
```

Remove unused volumes:
```bash
docker volume prune
```

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:3000/health`
3. Review README.md for detailed documentation

## ✨ What's Working

✅ Multi-language code execution (Python, JavaScript, Java, C++, Ruby, Go)
✅ Secure container isolation
✅ Input validation and sanitization
✅ Rate limiting and DDoS protection
✅ Comprehensive logging
✅ Health monitoring
✅ Queue management
✅ Interactive input support
✅ Frontend web interface
✅ REST API

Your production-ready code execution server is now live! 🎉
