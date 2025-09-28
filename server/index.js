import { config } from "dotenv";
import express from "express";
import sequelize, { connectDB } from "./config/connectdb.js";
import "./model/associations.js"; // Import associations
import routes from "./routes/index.js";
import createSuperAdmin from "./superadmin.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow credentials
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // yo chai frontend ko URL ho
    credentials: true, // Allow cookies and credentials 2 taii nai accept garxa

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Body parsing middleware
app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

await connectDB();

await sequelize.sync({ alter: false });
console.log("Database models synchronized successfully");

await createSuperAdmin();

app.use(routes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bus Management System API",
    version: "1.0.0",
    endpoints: {
      docs: "/api/v1/docs",
      health: "/api/v1/health",
      users: "/api/v1/users",
      routes: "/api/v1/routes",
      buses: "/api/v1/buses",
      booking: "/api/v1/bookings",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      docs: "/api/v1/docs",
      health: "/api/v1/health",
      users: "/api/v1/users",
      routes: "/api/v1/routes",
      buses: "/api/v1/buses",
      booking: "/api/v1/bookings",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
