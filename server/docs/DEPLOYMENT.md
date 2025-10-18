# 🚀 Deployment Guide

## Deployment Options

### 1. Local Development Setup

### 2. VPS/Cloud Server Deployment

### 3. Docker Deployment

### 4. Platform-as-a-Service (PaaS) Deployment

---

## 🖥️ Local Development Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git

### Setup Steps

1. **Clone Repository**

```bash
git clone https://github.com/yourusername/bus-management-system.git
cd bus-management-system
```

2. **Backend Setup**

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**

```bash
cd client/frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Database Setup**

```bash
# Create PostgreSQL database
createdb bus_management

# The application will automatically sync tables on startup
```

---

## ☁️ VPS/Cloud Server Deployment

### Server Requirements

- **OS**: Ubuntu 20.04 LTS or CentOS 8
- **RAM**: Minimum 2GB, Recommended 4GB
- **Storage**: Minimum 20GB SSD
- **CPU**: 2 cores minimum

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE bus_management_prod;
CREATE USER bus_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE bus_management_prod TO bus_user;
\q
```

### Step 3: Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/bus-management
sudo chown $USER:$USER /var/www/bus-management

# Clone repository
cd /var/www/bus-management
git clone https://github.com/yourusername/bus-management-system.git .

# Backend deployment
cd server
npm ci --production
cp .env.example .env
# Edit .env with production values
nano .env
```

**Production .env Configuration:**

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://bus_user:secure_password@localhost:5432/bus_management_prod
ACCESS_TOKEN_SECRET=your_very_long_secure_secret_here
REFRESH_TOKEN_SECRET=your_very_long_secure_secret_here
EMAIL_TOKEN_SECRET=your_very_long_secure_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

```bash
# Frontend deployment
cd ../client/frontend
npm ci
nano .env
```

**Production Frontend .env:**

```env
VITE_API_URL=https://yourdomain.com/api/v1
```

```bash
# Build frontend
npm run build

# Copy build files to nginx directory
sudo cp -r dist/* /var/www/html/
```

### Step 4: PM2 Process Management

```bash
# Create PM2 ecosystem file
cd /var/www/bus-management/server
nano ecosystem.config.js
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: "bus-management-api",
      script: "index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/log/bus-management/err.log",
      out_file: "/var/log/bus-management/out.log",
      log_file: "/var/log/bus-management/combined.log",
      time: true,
    },
  ],
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/bus-management
sudo chown $USER:$USER /var/log/bus-management

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/bus-management
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /var/www/bus-management/server/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bus-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## 🐳 Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Step 1: Prepare Docker Files

**docker-compose.prod.yml:**

```yaml
version: "3.8"

services:
  database:
    image: postgres:14-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: bus_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - bus-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    networks:
      - bus-network

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@database:5432/bus_management
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - database
      - redis
    volumes:
      - uploads:/app/uploads
    networks:
      - bus-network

  frontend:
    build:
      context: ./client/frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - bus-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - uploads:/var/www/uploads
    depends_on:
      - frontend
      - backend
    networks:
      - bus-network

volumes:
  postgres_data:
  uploads:

networks:
  bus-network:
    driver: bridge
```

**server/Dockerfile.prod:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

RUN mkdir -p uploads/users uploads/buses
RUN chown -R nodejs:nodejs uploads

USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
```

**client/frontend/Dockerfile.prod:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Deploy with Docker

```bash
# Create environment file
cp .env.example .env.prod

# Edit production environment variables
nano .env.prod

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 🌐 Platform-as-a-Service (PaaS) Deployment

### Heroku Deployment

1. **Prepare for Heroku**

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-bus-management-app
```

2. **Configure Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set ACCESS_TOKEN_SECRET=your_secret
heroku config:set REFRESH_TOKEN_SECRET=your_secret
heroku config:set EMAIL_TOKEN_SECRET=your_secret
# ... other variables
```

3. **Add PostgreSQL**

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Deploy**

```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Run migrations
heroku run npm run migrate
```

### DigitalOcean App Platform

1. **Create App Spec**

```yaml
# .do/app.yaml
name: bus-management-system
services:
  - name: api
    source_dir: /server
    github:
      repo: yourusername/bus-management-system
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}

  - name: web
    source_dir: /client/frontend
    github:
      repo: yourusername/bus-management-system
      branch: main
    build_command: npm run build
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs

databases:
  - name: db
    engine: PG
    version: "14"
    size: basic-xs
```

2. **Deploy**

```bash
# Install doctl
# Create app
doctl apps create .do/app.yaml
```

---

## 📊 Monitoring & Maintenance

### Health Check Endpoint

```javascript
// Add to server/routes/health.js
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    // Check Redis connection (if using)
    // await redis.ping();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

### Monitoring with PM2

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all

# Update application
cd /var/www/bus-management
git pull origin main
cd server
npm ci --production
pm2 restart all
```

### Database Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/bus-management"
DB_NAME="bus_management_prod"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U bus_user $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

```bash
# Make executable and schedule
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### SSL Certificate Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**

```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill process
sudo kill -9 PID
```

2. **Database Connection Issues**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Restart PostgreSQL
sudo systemctl restart postgresql
```

3. **Nginx Configuration Issues**

```bash
# Test Nginx configuration
sudo nginx -t
# Reload Nginx
sudo systemctl reload nginx
```

4. **PM2 Issues**

```bash
# Kill all PM2 processes
pm2 kill
# Start fresh
pm2 start ecosystem.config.js --env production
```

### Log Locations

- **Application Logs**: `/var/log/bus-management/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`
- **PM2 Logs**: `~/.pm2/logs/`

This deployment guide covers multiple deployment scenarios from development to production, with detailed steps for each platform and comprehensive monitoring setup.
