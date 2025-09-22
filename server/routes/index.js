import express from "express";
import userRoutes from "./user.routes.js";
import routeRoutes from "./route.routes.js";
import busRoutes from "./bus.routes.js";
import bookingRoutes from "./booking.routes.js";

const router = express.Router();

// API version prefix
const API_VERSION = "/api/v1";

// Mount all route modules
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/routes`, routeRoutes);
router.use(`${API_VERSION}/buses`, busRoutes);
router.use(`${API_VERSION}/bookings`, bookingRoutes);

// Health check endpoint
router.get(`${API_VERSION}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bus Management API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
router.get(`${API_VERSION}/docs`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bus Management API Documentation",
    endpoints: {
      users: {
        base: `${API_VERSION}/users`,
        public: [
          "POST /register - Register new user",
          "GET /verify - Verify email",
          "POST /login - User login",
          "POST /logout - User logout",
        ],
        authenticated: [
          "GET /me - Get own profile",
          "PUT /update-user - Update profile",
          "GET /drivers/available - Get available drivers",
        ],
        admin: [
          "GET / - Get all users",
          "GET /:id - Get user by ID",
          "POST /:userId/assign-driver - Assign driver role",
          "DELETE /:userId/remove-driver - Remove driver role",
          "PUT /:userId/role - Update user role",
          "GET /drivers/all - Get all drivers",
        ],
      },
      routes: {
        base: `${API_VERSION}/routes`,
        public: [
          "GET /search - Search routes",
          "GET /active - Get active routes",
          "GET /popular - Get popular routes",
          "GET /code/:code - Get route by code",
        ],
        authenticated: ["GET / - Get all routes", "GET /:id - Get route by ID"],
        admin: [
          "POST / - Create route",
          "PUT /:id - Update route",
          "DELETE /:id - Delete route",
          "DELETE /:id/permanent - Permanently delete route",
          "GET /analytics/stats - Get route statistics",
        ],
      },
      buses: {
        base: `${API_VERSION}/buses`,
        public: [
          "GET /available - Get available buses",
          "GET /route/:routeId - Get buses by route",
        ],
        authenticated: [
          "GET / - Get all buses",
          "GET /:id - Get bus by ID",
          "GET /number/:busNumber - Get bus by number",
          "GET /driver/:driverId - Get buses by driver",
          "PUT /:id/status - Update bus status",
        ],
        admin: [
          "POST / - Create bus",
          "PUT /:id - Update bus",
          "DELETE /:id - Delete bus",
          "DELETE /:id/permanent - Permanently delete bus",
          "PUT /:id/assign-route - Assign bus to route",
          "PUT /:id/assign-driver - Assign driver to bus",
          "DELETE /:id/remove-driver - Remove driver from bus",
          "GET /analytics/stats - Get bus statistics",
          "GET /maintenance/needed - Get buses needing maintenance",
        ],
      },
    },
  });
});

export default router;
