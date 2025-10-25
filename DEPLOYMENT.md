# Deployment Guide: NestJS Backend

## Overview

This guide covers deploying the new NestJS backend to production.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Database (SQLite for development, PostgreSQL/MySQL recommended for production)
- Reverse proxy (nginx, Apache, or Caddy)
- SSL certificate (Let's Encrypt recommended)

## Environment Configuration

### Development

Create `backend/.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=memos.db

# Authentication
JWT_SECRET=your-dev-secret-change-this

# CORS (optional, defaults to allow all)
CORS_ORIGIN=http://localhost:5173
```

### Production

Create `backend/.env.production`:
```env
# Server
PORT=3000
NODE_ENV=production

# Database (PostgreSQL example)
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=memos
DATABASE_PASSWORD=strong-password-here
DATABASE_NAME=memos_production

# Or SQLite for simpler setup
DATABASE_PATH=/var/lib/memos/memos.db

# Authentication
JWT_SECRET=very-secure-random-string-min-32-chars

# CORS
CORS_ORIGIN=https://yourdomain.com
```

## Installation Steps

### 1. Clone and Install Dependencies

```bash
cd /path/to/memos
cd backend
npm ci --production
```

### 2. Build the Application

```bash
npm run build
```

This creates a `dist/` directory with compiled JavaScript.

### 3. Database Setup

#### Option A: SQLite (Simple)
```bash
# No setup needed, database file is created automatically
# Just ensure the directory is writable
mkdir -p /var/lib/memos
chown -R memos:memos /var/lib/memos
```

#### Option B: PostgreSQL (Recommended for Production)
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE memos_production;
CREATE USER memos WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE memos_production TO memos;
\q

# Update .env.production with PostgreSQL settings
```

### 4. Run Database Migrations

The application auto-synchronizes schema on startup (TypeORM `synchronize: true`).

⚠️ **For production**, set `synchronize: false` and use migrations:
```bash
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode

#### Option 1: Direct Node
```bash
npm run start:prod
```

#### Option 2: PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name memos-backend

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs memos-backend
```

#### Option 3: Systemd Service

Create `/etc/systemd/system/memos-backend.service`:
```ini
[Unit]
Description=Memos NestJS Backend
After=network.target

[Service]
Type=simple
User=memos
WorkingDirectory=/opt/memos/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable memos-backend
sudo systemctl start memos-backend
sudo systemctl status memos-backend
```

## Reverse Proxy Configuration

### Nginx

Create `/etc/nginx/sites-available/memos`:
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
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (if serving from same domain)
    location / {
        root /opt/memos/web/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/memos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Caddy (Automatic HTTPS)

Create `Caddyfile`:
```
yourdomain.com {
    # API
    handle /api/* {
        reverse_proxy localhost:3000
    }

    # Frontend
    handle {
        root * /opt/memos/web/dist
        try_files {path} /index.html
        file_server
    }
}
```

Start Caddy:
```bash
caddy run
```

## Docker Deployment

### Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/memos.db
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - memos-data:/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=memos
      - POSTGRES_USER=memos
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  memos-data:
  postgres-data:
```

Run:
```bash
docker-compose up -d
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong passwords
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up firewall (allow only 80, 443)
- [ ] Regular security updates
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Regular database backups
- [ ] Use environment variables (never commit secrets)
- [ ] Disable synchronize in production (use migrations)

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### System Logs
```bash
# Systemd
sudo journalctl -u memos-backend -f

# Docker
docker-compose logs -f backend
```

### Health Check
```bash
curl http://localhost:3000/healthz
```

## Backup

### SQLite Database
```bash
# Stop application
pm2 stop memos-backend

# Backup
cp /var/lib/memos/memos.db /backup/memos-$(date +%Y%m%d).db

# Start application
pm2 start memos-backend
```

### PostgreSQL Database
```bash
pg_dump -U memos memos_production > backup-$(date +%Y%m%d).sql
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs memos-backend --err

# Check Node version
node --version  # Should be 18+

# Check environment
cat .env.production

# Test manually
NODE_ENV=production node dist/main.js
```

### Database Connection Issues
```bash
# SQLite: Check file permissions
ls -l /var/lib/memos/memos.db

# PostgreSQL: Test connection
psql -h localhost -U memos -d memos_production
```

### High Memory Usage
```bash
# Set Node memory limit
node --max-old-space-size=512 dist/main.js

# Or in PM2
pm2 start dist/main.js --name memos-backend --max-memory-restart 500M
```

## Performance Tuning

### Enable Compression
Already enabled in NestJS with `@nestjs/platform-express`.

### Database Connection Pooling
Configure in `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  // ...
  extra: {
    max: 10,  // Maximum connections
    min: 2,   // Minimum connections
  },
})
```

### Caching
Add Redis for caching:
```typescript
// In app.module.ts
CacheModule.register({
  isGlobal: true,
  store: redisStore,
  host: 'localhost',
  port: 6379,
})
```

## Migration from Go Backend

When ready to migrate from Go backend:

1. **Backup current data**
2. **Run both backends in parallel** (different ports)
3. **Test new backend thoroughly**
4. **Update frontend** to use new backend
5. **Monitor for issues**
6. **Decommission Go backend** after verification

## Support

For issues or questions:
- Check `MIGRATION_SUMMARY.md`
- Review `backend/QUICKSTART.md`
- Run test script: `bash backend/test-backend.sh`

---

*Last updated: 2025-10-25*
