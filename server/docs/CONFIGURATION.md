# ⚙️ Configuration Guide

## Environment Configuration

### Development Environment

#### Backend (.env)

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/bus_management
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_management
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token_min_32_characters
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_min_32_characters
EMAIL_TOKEN_SECRET=your_super_secret_email_token_min_32_characters

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@busmanagement.com
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=admin123456

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=Bus Management System
VITE_APP_VERSION=1.0.0

# Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### Production Environment

#### Backend (.env.production)

```env
# Database Configuration (Use SSL in production)
DATABASE_URL=postgresql://prod_user:secure_password@prod_host:5432/bus_management_prod?ssl=true
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=bus_management_prod
DB_USER=prod_user
DB_PASSWORD=very_secure_production_password

# JWT Configuration (Use strong secrets)
ACCESS_TOKEN_SECRET=your_extremely_long_and_secure_access_token_secret_for_production
REFRESH_TOKEN_SECRET=your_extremely_long_and_secure_refresh_token_secret_for_production
EMAIL_TOKEN_SECRET=your_extremely_long_and_secure_email_token_secret_for_production

# Email Configuration (Production Email Service)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_production_email_password

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Origins (Your production domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# SSL Configuration
SSL_KEY_PATH=/path/to/ssl/private.key
SSL_CERT_PATH=/path/to/ssl/certificate.crt

# Logging
LOG_LEVEL=error
LOG_FILE_PATH=/var/log/bus-management/app.log

# Redis Configuration (for sessions/caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Monitoring
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

#### Frontend (.env.production)

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api/v1

# App Configuration
VITE_APP_NAME=Bus Management System
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_HOTJAR_ID=your_hotjar_id

# CDN Configuration
VITE_CDN_URL=https://cdn.yourdomain.com
```

---

## Server Configuration

### Express.js Configuration

```javascript
// config/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
```

### Database Configuration

```javascript
// config/database.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
});

export default sequelize;
```

---

## Middleware Configuration

### Authentication Middleware

```javascript
// middleware/auth.js
import jwt from "jsonwebtoken";
import { findById } from "../services/user.service.js";

const authenticated = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticated;
```

### Error Handling Middleware

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((error) => error.message).join(", ");
    error = { message, statusCode: 400 };
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

export default errorHandler;
```

### Logging Middleware

```javascript
// middleware/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "bus-management-api" },
  transports: [
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH || "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH || "logs/combined.log",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

---

## Frontend Configuration

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: process.env.NODE_ENV === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["axios"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### Axios Configuration

```javascript
// src/config/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Docker Configuration

### Backend Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/users uploads/buses

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  database:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: bus_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@database:5432/bus_management
    depends_on:
      - database
    volumes:
      - ./server/uploads:/app/uploads

  frontend:
    build: ./client/frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## Nginx Configuration

### Production Nginx

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth endpoints (stricter rate limiting)
        location /api/v1/users/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Static files (uploads)
        location /uploads/ {
            proxy_pass http://backend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## SSL/TLS Configuration

### Let's Encrypt Setup

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### SSL Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Rest of configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

This configuration guide provides comprehensive setup instructions for development, testing, and production environments with security best practices and performance optimizations.
