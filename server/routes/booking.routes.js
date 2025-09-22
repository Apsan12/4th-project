import express from "express";
import BookingController from "../controller/booking.controller.js";

import {
  validateCreateBooking,
  validateUpdateBookingStatus,
  validateCancelBooking,
  validateGetUserBookings,
  validateCheckSeatAvailability,
  validateGetBookingBySlug,
  validateAdminUpdateBooking,
  validateBulkUpdateBookings,
} from "../validation/booking.validation.js";
import authenticated from "../middleware/auth.js";
import authorization from "../middleware/authorize.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================


router.get(
  "/availability",
  validateCheckSeatAvailability,
  BookingController.checkSeatAvailability
);

// ==================== PROTECTED ROUTES (USER) ====================

// Create a new booking (authenticated users only)
router.post(
  "/",
  authenticated,
  validateCreateBooking,
  BookingController.createBooking
);

// Get user's own bookings with pagination and filters
router.get(
  "/my-bookings",
  authenticated,
  validateGetUserBookings,
  BookingController.getUserBookings
);

// Get specific booking by slug (user can only see their own)
router.get(
  "/:slug",
  authenticated,
  validateGetBookingBySlug,
  BookingController.getBookingBySlug
);

// Cancel user's own booking
router.patch(
  "/:slug/cancel",
  authenticated,
  validateCancelBooking,
  BookingController.cancelBooking
);

// Update booking status (user can only update payment info)
router.patch(
  "/:slug/status",
  authenticated ,
  validateUpdateBookingStatus,
  BookingController.updateBookingStatus
);

// ==================== ADMIN ROUTES ====================

router.get(
  "/admin/statistics",
  authenticated,
  authorization("admin"),
  BookingController.getBookingStats
);

router.get(
  "/admin/popular-routes",
  authenticated,
  authorization("admin"),
  BookingController.getPopularRoutes
);

router.get(
  "/admin/all",
  authenticated,
  authorization("admin"),
  validateGetUserBookings, 
  BookingController.getUserBookings
);

// Bulk update bookings (admin only)
router.patch(
  "/admin/bulk-update",
  authenticated,
  authorization("admin"),
  validateBulkUpdateBookings,
  BookingController.bulkUpdateBookings
);

// Admin full update of any booking
router.patch(
  "/admin/:slug",
  authenticated,
  authorization("admin"),
  validateAdminUpdateBooking,
  BookingController.adminUpdateBooking
);

// ==================== DRIVER/ADMIN ROUTES ====================

// Get bookings by bus and date (for drivers and admins)
router.get(
  "/bus/bookings",
  authenticated,
  authorization(["admin", "busDriver"]),
  BookingController.getBookingsByBusAndDate
);

// ==================== ROUTE DOCUMENTATION ====================

// Health check for booking routes
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking routes are working",
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        "GET /api/v1/bookings/availability - Check seat availability",
        "GET /api/v1/bookings/health - Health check",
      ],
      user: [
        "POST /api/v1/bookings - Create booking",
        "GET /api/v1/bookings/my-bookings - Get user bookings",
        "GET /api/v1/bookings/:slug - Get booking details",
        "PATCH /api/v1/bookings/:slug/cancel - Cancel booking",
        "PATCH /api/v1/bookings/:slug/status - Update booking status",
      ],
      admin: [
        "GET /api/v1/bookings/admin/statistics - Get booking stats",
        "GET /api/v1/bookings/admin/popular-routes - Get popular routes",
        "GET /api/v1/bookings/admin/all - Get all bookings",
        "PATCH /api/v1/bookings/admin/bulk-update - Bulk update bookings",
        "PATCH /api/v1/bookings/admin/:slug - Admin update booking",
      ],
      driver: ["GET /api/v1/bookings/bus/bookings - Get bus bookings by date"],
    },
  });
});

// Export router
export default router;
