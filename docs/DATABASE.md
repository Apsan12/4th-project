# 🗃️ Database Documentation

## Database Architecture

### Database Management System

- **DBMS**: PostgreSQL 12+
- **ORM**: Sequelize v6
- **Connection Pool**: Default Sequelize pool configuration

### Database Configuration

```javascript
// config/connectdb.js
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
```

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │    Buses    │    │   Routes    │
│             │    │             │    │             │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ username    │    │ busNumber   │    │ routeName   │
│ email       │    │ busType     │    │ startLoc    │
│ password    │    │ capacity    │    │ endLoc      │
│ role        │    │ routeId (FK)│◄───┤ distance    │
│ phoneNumber │    │ driverId(FK)│    │ duration    │
│ imageUrl    │    │ status      │    │ isActive    │
│ isVerified  │    │ licensePlate│    │ createdAt   │
│ createdAt   │    │ imageUrl    │    │ updatedAt   │
│ updatedAt   │    │ isActive    │    └─────────────┘
└─────────────┘    │ amenities   │           │
       │           │ description │           │
       │           │ createdAt   │           │
       │           │ updatedAt   │           │
       │           └─────────────┘           │
       │                  │                 │
       │                  │                 │
       ▼                  ▼                 ▼
┌─────────────────────────────────────────────┐
│               Bookings                      │
│                                             │
│ id (PK)                                     │
│ userId (FK) ────────────────────────────────┤
│ busId (FK)  ────────────────────────────────┤
│ routeId (FK) ───────────────────────────────┤
│ seatNumber                                  │
│ travelDate                                  │
│ bookingStatus                               │
│ totalAmount                                 │
│ passengerDetails (JSONB)                    │
│ createdAt                                   │
│ updatedAt                                   │
└─────────────────────────────────────────────┘
```

---

## 📋 Table Schemas

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'busDriver')),
    phoneNumber VARCHAR(20),
    imageUrl VARCHAR(255),
    isVerified BOOLEAN DEFAULT false,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(isVerified);
```

**Constraints:**

- `email`: Must be unique and follow email format
- `role`: Must be one of 'user', 'admin', 'busDriver'
- `username`: Minimum 3 characters, maximum 50
- `password`: Stored as bcrypt hash

### Routes Table

```sql
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    routeName VARCHAR(100) NOT NULL,
    startLocation VARCHAR(100) NOT NULL,
    endLocation VARCHAR(100) NOT NULL,
    distance DECIMAL(8,2) CHECK (distance > 0),
    estimatedDuration INTEGER CHECK (estimatedDuration > 0),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_routes_active ON routes(isActive);
CREATE INDEX idx_routes_locations ON routes(startLocation, endLocation);
```

**Constraints:**

- `distance`: Must be positive decimal (kilometers)
- `estimatedDuration`: Must be positive integer (minutes)
- `routeName`: Maximum 100 characters

### Buses Table

```sql
CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    busNumber VARCHAR(20) UNIQUE NOT NULL,
    busType VARCHAR(20) DEFAULT 'standard' CHECK (busType IN ('standard', 'luxury', 'semi-luxury', 'sleeper')),
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 100),
    routeId INTEGER REFERENCES routes(id) ON DELETE SET NULL,
    driverId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in-transit', 'maintenance', 'out-of-service')),
    licensePlate VARCHAR(15) UNIQUE,
    imageUrl VARCHAR(255),
    isActive BOOLEAN DEFAULT true,
    amenities JSONB DEFAULT '[]',
    description TEXT,
    model VARCHAR(50),
    manufacturer VARCHAR(50),
    yearOfManufacture INTEGER CHECK (yearOfManufacture >= 1950),
    lastMaintenanceDate DATE,
    nextMaintenanceDate DATE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_maintenance_dates CHECK (
        nextMaintenanceDate IS NULL OR
        lastMaintenanceDate IS NULL OR
        nextMaintenanceDate > lastMaintenanceDate
    )
);

-- Indexes
CREATE INDEX idx_buses_number ON buses(busNumber);
CREATE INDEX idx_buses_route ON buses(routeId);
CREATE INDEX idx_buses_driver ON buses(driverId);
CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_buses_active ON buses(isActive);
CREATE INDEX idx_buses_type ON buses(busType);
```

**Constraints:**

- `busNumber`: Must be unique, uppercase alphanumeric
- `capacity`: Between 1 and 100 passengers
- `busType`: One of defined enum values
- `status`: One of defined enum values
- `amenities`: JSON array of amenity strings

### Bookings Table

```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    busId INTEGER NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    routeId INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    seatNumber VARCHAR(10) NOT NULL,
    travelDate DATE NOT NULL,
    bookingStatus VARCHAR(20) DEFAULT 'confirmed' CHECK (bookingStatus IN ('confirmed', 'cancelled', 'completed', 'no-show')),
    totalAmount DECIMAL(10,2) NOT NULL CHECK (totalAmount >= 0),
    passengerDetails JSONB NOT NULL,
    paymentStatus VARCHAR(20) DEFAULT 'pending' CHECK (paymentStatus IN ('pending', 'paid', 'refunded', 'failed')),
    bookingReference VARCHAR(20) UNIQUE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure no double booking of same seat
    CONSTRAINT unique_seat_booking UNIQUE (busId, seatNumber, travelDate)
);

-- Indexes
CREATE INDEX idx_bookings_user ON bookings(userId);
CREATE INDEX idx_bookings_bus ON bookings(busId);
CREATE INDEX idx_bookings_route ON bookings(routeId);
CREATE INDEX idx_bookings_date ON bookings(travelDate);
CREATE INDEX idx_bookings_status ON bookings(bookingStatus);
CREATE INDEX idx_bookings_reference ON bookings(bookingReference);
```

**Constraints:**

- `totalAmount`: Must be non-negative
- `travelDate`: Cannot be in the past
- `seatNumber`: Format like A1, B12, etc.
- `passengerDetails`: JSON with required passenger information

---

## 🔗 Relationships

### One-to-Many Relationships

1. **Routes → Buses**

   - One route can have multiple buses
   - Foreign key: `buses.routeId`

2. **Users → Buses** (Driver assignment)

   - One user (driver) can be assigned to multiple buses
   - Foreign key: `buses.driverId`

3. **Users → Bookings**

   - One user can have multiple bookings
   - Foreign key: `bookings.userId`

4. **Buses → Bookings**

   - One bus can have multiple bookings
   - Foreign key: `bookings.busId`

5. **Routes → Bookings**
   - One route can have multiple bookings
   - Foreign key: `bookings.routeId`

### Sequelize Associations

```javascript
// model/associations.js
User.hasMany(Bus, { foreignKey: "driverId", as: "assignedBuses" });
Bus.belongsTo(User, { foreignKey: "driverId", as: "driver" });

Route.hasMany(Bus, { foreignKey: "routeId" });
Bus.belongsTo(Route, { foreignKey: "routeId", as: "route" });

User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

Bus.hasMany(Booking, { foreignKey: "busId" });
Booking.belongsTo(Bus, { foreignKey: "busId", as: "bus" });

Route.hasMany(Booking, { foreignKey: "routeId" });
Booking.belongsTo(Route, { foreignKey: "routeId", as: "route" });
```

---

## 🏗️ Database Operations

### Common Queries

#### Get Buses with Route Information

```sql
SELECT
    b.id,
    b.busNumber,
    b.busType,
    b.capacity,
    b.status,
    r.routeName,
    r.startLocation,
    r.endLocation
FROM buses b
JOIN routes r ON b.routeId = r.id
WHERE b.isActive = true
ORDER BY b.busNumber;
```

#### Get User Bookings with Details

```sql
SELECT
    bk.id,
    bk.seatNumber,
    bk.travelDate,
    bk.bookingStatus,
    bk.totalAmount,
    b.busNumber,
    r.routeName,
    r.startLocation,
    r.endLocation
FROM bookings bk
JOIN buses b ON bk.busId = b.id
JOIN routes r ON bk.routeId = r.id
WHERE bk.userId = $1
ORDER BY bk.travelDate DESC;
```

#### Get Available Buses for Route

```sql
SELECT
    b.*,
    r.routeName
FROM buses b
JOIN routes r ON b.routeId = r.id
WHERE b.routeId = $1
    AND b.status = 'available'
    AND b.isActive = true;
```

#### Booking Statistics

```sql
SELECT
    COUNT(*) as totalBookings,
    SUM(totalAmount) as totalRevenue,
    COUNT(CASE WHEN bookingStatus = 'confirmed' THEN 1 END) as confirmedBookings,
    COUNT(CASE WHEN bookingStatus = 'cancelled' THEN 1 END) as cancelledBookings
FROM bookings
WHERE travelDate >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 🔧 Database Maintenance

### Backup Strategy

```bash
# Daily backup
pg_dump -h localhost -U postgres -d bus_management > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres -d bus_management < backup_20240101.sql
```

### Database Optimization

#### Analyze Table Statistics

```sql
ANALYZE users;
ANALYZE buses;
ANALYZE routes;
ANALYZE bookings;
```

#### Vacuum Tables

```sql
VACUUM ANALYZE users;
VACUUM ANALYZE buses;
VACUUM ANALYZE routes;
VACUUM ANALYZE bookings;
```

#### Index Monitoring

```sql
-- Check index usage
SELECT
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 🔐 Security Considerations

### Data Protection

- Passwords stored using bcrypt with salt rounds = 10
- JWT tokens with expiration
- Email addresses normalized (lowercase)
- Input validation at application level

### Access Control

```sql
-- Create application user with limited privileges
CREATE USER bus_app_user WITH PASSWORD 'secure_password';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO bus_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON buses TO bus_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON routes TO bus_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO bus_app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bus_app_user;
```

### Audit Trail

```sql
-- Create audit table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation VARCHAR(10),
    user_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 Performance Monitoring

### Query Performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Monitor slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Database Size Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('bus_management'));

-- Check table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

---

## 🗂️ Migration Scripts

### Initial Schema Creation

```sql
-- migrations/001_initial_schema.sql
-- Run this script to create the initial database schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in order (respecting foreign key dependencies)
-- 1. Users table
-- 2. Routes table
-- 3. Buses table
-- 4. Bookings table

-- Insert default data
INSERT INTO routes (routeName, startLocation, endLocation, distance, estimatedDuration)
VALUES
    ('City Center to Airport', 'City Center', 'International Airport', 25.5, 45),
    ('Downtown to Beach', 'Downtown Plaza', 'Sunset Beach', 18.2, 35);
```

### Add Image Fields Migration

```sql
-- migrations/002_add_image_fields.sql
ALTER TABLE users ADD COLUMN imageUrl VARCHAR(255);
ALTER TABLE buses ADD COLUMN imageUrl VARCHAR(255);
```

This database documentation provides a comprehensive overview of the database structure, relationships, security considerations, and maintenance procedures for the Bus Management System.
