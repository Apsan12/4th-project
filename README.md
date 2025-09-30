# 🚌 Bus Management System - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Frontend Documentation](#frontend-documentation)
8. [File Upload System](#file-upload-system)
9. [Deployment Guide](#deployment-guide)
10. [Contributing](#contributing)

---

## 🎯 Project Overview

The Bus Management System is a comprehensive full-stack web application designed to manage bus operations, routes, bookings, and user management. The system provides separate interfaces for administrators, drivers, and passengers.

### 🔧 Technology Stack

**Backend:**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Validation**: Zod
- **Security**: bcrypt, CORS

**Frontend:**

- **Framework**: React.js
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3
- **Build Tool**: Vite

### 🎨 Key Features

- **User Management**: Registration, login, profile management with image uploads
- **Bus Management**: CRUD operations for buses with image support
- **Route Management**: Define and manage bus routes
- **Booking System**: Passenger booking functionality
- **Dashboard**: Real-time analytics and statistics
- **Email Verification**: Secure user registration with email confirmation
- **Password Reset**: Secure password recovery system
- **Role-based Access**: Admin, Driver, and User roles
- **Responsive Design**: Mobile-friendly interface

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
│   Port: 5173    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure

```
4_project/
├── client/
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── routes/
│       │   └── assets/
│       ├── public/
│       └── package.json
├── server/
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validation/
│   ├── uploads/
│   └── package.json
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to server directory:**

```bash
cd server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file (.env):**

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bus_management
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_management
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_TOKEN_SECRET=your_email_token_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@busmanagement.com
SUPER_ADMIN_PASSWORD=admin123
```

4. **Setup PostgreSQL database:**

```sql
CREATE DATABASE bus_management;
```

5. **Run database migrations:**

```bash
# The app will automatically sync the database on startup
npm run dev
```

### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd client/frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file (.env):**

```env
VITE_API_URL=http://localhost:5000/api/v1
```

4. **Start development server:**

```bash
npm run dev
```

### Running the Application

1. **Start Backend:**

```bash
cd server
npm run dev
```

2. **Start Frontend:**

```bash
cd client/frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/v1/docs

---

## 🔌 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890"
}
```

#### Login User

```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Email

```http
GET /users/verify-email?token=verification_token
```

#### Get User Profile

```http
GET /users/me
Authorization: Bearer <access_token>
```

#### Update User Profile

```http
PUT /users/update-user
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "username": "new_username",
  "phoneNumber": "+0987654321",
  "userImage": <file>
}
```

#### Logout User

```http
POST /users/logout
Authorization: Bearer <access_token>
```

### Bus Management Endpoints

#### Get All Buses

```http
GET /buses
Authorization: Bearer <access_token>
```

#### Create Bus

```http
POST /buses
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "busNumber": "BUS001",
  "busType": "luxury",
  "capacity": 50,
  "routeId": 1,
  "licensePlate": "ABC123",
  "busImage": <file>
}
```

#### Update Bus

```http
PUT /buses/:id
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "busNumber": "BUS002",
  "capacity": 45,
  "busImage": <file>
}
```

#### Delete Bus

```http
DELETE /buses/:id
Authorization: Bearer <access_token>
```

### Route Management Endpoints

#### Get All Routes

```http
GET /routes
Authorization: Bearer <access_token>
```

#### Create Route

```http
POST /routes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "routeName": "City Center to Airport",
  "startLocation": "City Center",
  "endLocation": "International Airport",
  "distance": 25.5,
  "estimatedDuration": 45
}
```

### Booking Endpoints

#### Create Booking

```http
POST /bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "busId": 1,
  "routeId": 1,
  "seatNumber": "A12",
  "travelDate": "2024-01-15",
  "passengerDetails": {
    "name": "John Doe",
    "phone": "+1234567890"
  }
}
```

#### Get User Bookings

```http
GET /bookings/my-bookings
Authorization: Bearer <access_token>
```

---

## 🗃️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  phoneNumber VARCHAR(20),
  imageUrl VARCHAR(255),
  isVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Buses Table

```sql
CREATE TABLE buses (
  id SERIAL PRIMARY KEY,
  busNumber VARCHAR(20) UNIQUE NOT NULL,
  busType VARCHAR(20) DEFAULT 'standard',
  capacity INTEGER NOT NULL,
  routeId INTEGER REFERENCES routes(id),
  driverId INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'available',
  licensePlate VARCHAR(15),
  imageUrl VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  amenities JSONB,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Routes Table

```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  routeName VARCHAR(100) NOT NULL,
  startLocation VARCHAR(100) NOT NULL,
  endLocation VARCHAR(100) NOT NULL,
  distance DECIMAL(8,2),
  estimatedDuration INTEGER,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  busId INTEGER REFERENCES buses(id),
  routeId INTEGER REFERENCES routes(id),
  seatNumber VARCHAR(10),
  travelDate DATE,
  bookingStatus VARCHAR(20) DEFAULT 'confirmed',
  totalAmount DECIMAL(10,2),
  passengerDetails JSONB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication & Authorization

### JWT Token System

The system uses JWT tokens for authentication with the following structure:

- **Access Token**: Short-lived (1 hour), used for API requests
- **Refresh Token**: Long-lived (7 days), used to generate new access tokens
- **Email Verification Token**: One-time use, for email verification

### User Roles

1. **Admin**: Full system access, can manage buses, routes, and users
2. **Bus Driver**: Can view assigned buses and routes
3. **User**: Can book tickets and manage their profile

### Protected Routes

All routes except registration, login, and email verification require authentication.

### Middleware Chain

```javascript
// Example protected route
route.get(
  "/protected-endpoint",
  authenticated, // Verify JWT token
  authorization("admin"), // Check user role
  controller // Execute business logic
);
```

---

## 🎨 Frontend Documentation

### Component Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation component
│   ├── SideBar.jsx         # Sidebar navigation
│   ├── Footer.jsx          # Footer component
│   └── ProtectedRoute.jsx  # Route protection
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Verify.jsx      # Email verification
│   │   └── UserProfile.jsx # User profile management
│   ├── Dashboard/
│   │   └── Dashboard.jsx   # Main dashboard
│   ├── company/
│   │   ├── AboutUs.jsx     # About page
│   │   └── ContactUs.jsx   # Contact page
│   └── home/
│       └── Home.jsx        # Landing page
├── Services/
│   ├── api.js              # Axios configuration
│   └── auth.js             # Authentication services
└── Routes/
    └── index.jsx           # Application routing
```

### Key React Hooks Used

- `useState`: Component state management
- `useEffect`: Side effects and lifecycle
- `useNavigate`: Programmatic navigation
- `useSearchParams`: URL parameter handling

### State Management

The application uses React's built-in state management with localStorage for persistence:

- JWT tokens stored in localStorage
- User session data cached locally
- Form state managed with controlled components

### Responsive Design

- Mobile-first approach
- CSS Grid and Flexbox layouts
- Breakpoints: 768px (tablet), 1024px (desktop)

---

## 📁 File Upload System

### Supported File Types

- **Images**: JPEG, PNG, WebP
- **Maximum Size**: 5MB per file
- **Storage**: Local filesystem with organized directory structure

### Upload Directories

```
uploads/
├── users/          # User profile images
├── buses/          # Bus images
└── misc/           # Other files
```

### Security Features

- File type validation
- Size restrictions
- Unique filename generation
- Automatic cleanup on errors
- Static file serving with proper headers

### Usage Example

```javascript
// Frontend - File upload
const formData = new FormData();
formData.append("userImage", selectedFile);
formData.append("username", "newUsername");

await fetch("/api/v1/users/update-user", {
  method: "PUT",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 🚀 Deployment Guide

### Production Environment Variables

```env
# Production Database
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/bus_management_prod

# Security (Use strong secrets in production)
ACCESS_TOKEN_SECRET=very_strong_access_secret_min_32_chars
REFRESH_TOKEN_SECRET=very_strong_refresh_secret_min_32_chars
EMAIL_TOKEN_SECRET=very_strong_email_secret_min_32_chars

# Production Email Service
EMAIL_HOST=smtp.yourprovider.com
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_production_email_password

# Production Settings
NODE_ENV=production
PORT=5000
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files (uploads)
    location /uploads/ {
        proxy_pass http://localhost:5000;
    }
}
```

### Database Migration

```bash
# Production database setup
psql -U postgres -c "CREATE DATABASE bus_management_prod;"
psql -U postgres -d bus_management_prod -f migrations/schema.sql
```

---

## 🧪 Testing

### Backend Testing

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### API Testing with Postman

Import the Postman collection from `/docs/postman_collection.json` for comprehensive API testing.

---

## 🔧 Configuration

### CORS Configuration

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://yourdomain.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);
```

### Rate Limiting

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Check PostgreSQL service is running
   - Verify database credentials in .env
   - Ensure database exists

2. **JWT Token Invalid**

   - Check token expiration
   - Verify JWT secrets match
   - Clear localStorage and re-login

3. **File Upload Errors**

   - Check file size (max 5MB)
   - Verify file type is supported
   - Ensure uploads directory has write permissions

4. **CORS Errors**
   - Verify frontend URL in CORS configuration
   - Check withCredentials setting in axios

### Logs Location

- Backend logs: Console output or `/logs/` directory
- Frontend errors: Browser console
- Database logs: PostgreSQL log files

---

## 📞 Support & Contributing

### Bug Reports

Please report bugs through GitHub issues with:

- Detailed description
- Steps to reproduce
- Environment details
- Error logs/screenshots

### Feature Requests

Submit feature requests with:

- Clear description of the feature
- Use case explanation
- Acceptance criteria

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- Express.js community for the robust framework
- React team for the excellent frontend library
- Sequelize team for the powerful ORM
- All contributors and testers

---

**Last Updated**: September 30, 2025  
**Version**: 1.0.0  
**Maintainer**: Bus Management Team
