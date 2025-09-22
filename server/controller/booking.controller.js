import BookingService from "../services/booking.service.js";
import { sendMail } from "../utils/sendmail.js";

class BookingController {
  // Create a new booking
  static async createBooking(req, res) {
    try {
      const bookingData = req.body;
      const userInfo = req.user; // From auth middleware
      const requestInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      };

      // Create booking
      const booking = await BookingService.createBooking(
        bookingData,
        userInfo,
        requestInfo
      );

      // Send confirmation email (non-blocking)
      try {
        await BookingController.sendBookingConfirmationEmail(booking);
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        // Don't fail the booking if email fails
      }

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: {
          booking: {
            slug: booking.slug,
            bookingReference: booking.bookingReference,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            totalAmount: booking.totalAmount,
            seatNumbers: booking.seatNumbers,
            travelDate: booking.travelDate,
            bus: {
              busNumber: booking.bus.busNumber,
              busType: booking.bus.busType,
              route: {
                routeName: booking.bus.route.routeName,
                origin: booking.bus.route.origin,
                destination: booking.bus.route.destination,
              },
            },
            passengerNames: booking.passengerNames,
            contactPhone: booking.contactPhone,
            contactEmail: booking.contactEmail,
            createdAt: booking.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create booking",
      });
    }
  }

  // Get booking by slug
  static async getBookingBySlug(req, res) {
    try {
      const { slug } = req.params;
      const userInfo = req.user;

      // Non-admin users can only view their own bookings
      const userId = userInfo.role === "admin" ? null : userInfo.id;
      
      const booking = await BookingService.getBookingBySlug(slug, userId);

      res.status(200).json({
        success: true,
        message: "Booking retrieved successfully",
        data: { booking },
      });
    } catch (error) {
      console.error("Get booking error:", error);
      const statusCode = error.message === "Booking not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to get booking",
      });
    }
  }

  // Get user bookings with pagination
  static async getUserBookings(req, res) {
    try {
      const userInfo = req.user;
      const options = req.query;

      // Admin can get bookings for any user
      const userId = userInfo.role === "admin" && req.query.userId 
        ? parseInt(req.query.userId) 
        : userInfo.id;

      const result = await BookingService.getUserBookings(userId, options);

      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Get user bookings error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get bookings",
      });
    }
  }

  // Check seat availability
  static async checkSeatAvailability(req, res) {
    try {
      const { busId, travelDate, seatNumbers } = req.query;

      const availability = await BookingService.checkSeatAvailability(
        busId,
        travelDate,
        seatNumbers
      );

      res.status(200).json({
        success: true,
        message: "Seat availability checked successfully",
        data: { availability },
      });
    } catch (error) {
      console.error("Check seat availability error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to check seat availability",
      });
    }
  }

  // Update booking status
  static async updateBookingStatus(req, res) {
    try {
      const { slug } = req.params;
      const statusData = req.body;
      const userInfo = req.user;

      const updatedBooking = await BookingService.updateBookingStatus(
        slug,
        statusData,
        userInfo
      );

      // Send status update email (non-blocking)
      try {
        await BookingController.sendStatusUpdateEmail(updatedBooking, statusData.status);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }

      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        data: { booking: updatedBooking },
      });
    } catch (error) {
      console.error("Update booking status error:", error);
      const statusCode = error.message === "Booking not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update booking status",
      });
    }
  }

  // Cancel booking
  static async cancelBooking(req, res) {
    try {
      const { slug } = req.params;
      const { reason } = req.body;
      const userInfo = req.user;

      const cancelledBooking = await BookingService.cancelBooking(
        slug,
        userInfo.id,
        reason
      );

      // Send cancellation email (non-blocking)
      try {
        await BookingController.sendCancellationEmail(cancelledBooking, reason);
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }

      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: { booking: cancelledBooking },
      });
    } catch (error) {
      console.error("Cancel booking error:", error);
      const statusCode = error.message === "Booking not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to cancel booking",
      });
    }
  }

  // Get booking statistics (admin only)
  static async getBookingStats(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      const dateRange = { fromDate, toDate };

      const stats = await BookingService.getBookingStats(dateRange);

      res.status(200).json({
        success: true,
        message: "Booking statistics retrieved successfully",
        data: { stats },
      });
    } catch (error) {
      console.error("Get booking stats error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get booking statistics",
      });
    }
  }

  // Get popular routes (admin only)
  static async getPopularRoutes(req, res) {
    try {
      const { limit = 10 } = req.query;

      const popularRoutes = await BookingService.getPopularRoutes(parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Popular routes retrieved successfully",
        data: { routes: popularRoutes },
      });
    } catch (error) {
      console.error("Get popular routes error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get popular routes",
      });
    }
  }

  // Bulk update bookings (admin only)
  static async bulkUpdateBookings(req, res) {
    try {
      const { bookingSlugs, updates } = req.body;

      const updatedBookings = await BookingService.bulkUpdateBookings(
        bookingSlugs,
        updates
      );

      res.status(200).json({
        success: true,
        message: `${updatedBookings.length} bookings updated successfully`,
        data: { 
          updatedCount: updatedBookings.length,
          bookings: updatedBookings.map(b => ({
            slug: b.slug,
            status: b.status,
            paymentStatus: b.paymentStatus,
          })),
        },
      });
    } catch (error) {
      console.error("Bulk update bookings error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update bookings",
      });
    }
  }

  // Get bookings by bus and date (admin/driver only)
  static async getBookingsByBusAndDate(req, res) {
    try {
      const { busId, travelDate } = req.query;

      if (!busId || !travelDate) {
        return res.status(400).json({
          success: false,
          message: "Bus ID and travel date are required",
        });
      }

      const result = await BookingService.getBookingsByBusAndDate(
        parseInt(busId),
        travelDate
      );

      res.status(200).json({
        success: true,
        message: "Bus bookings retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Get bus bookings error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get bus bookings",
      });
    }
  }

  // Admin update booking (full update)
  static async adminUpdateBooking(req, res) {
    try {
      const { slug } = req.params;
      const updateData = req.body;
      const userInfo = req.user;

      // Only admins can perform full updates
      if (userInfo.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const updatedBooking = await BookingService.updateBookingStatus(
        slug,
        updateData,
        userInfo
      );

      res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        data: { booking: updatedBooking },
      });
    } catch (error) {
      console.error("Admin update booking error:", error);
      const statusCode = error.message === "Booking not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update booking",
      });
    }
  }

  // Email helper methods
  static async sendBookingConfirmationEmail(booking) {
    const emailData = {
      to: booking.contactEmail,
      subject: `Booking Confirmation - ${booking.bookingReference}`,
      html: BookingController.generateBookingConfirmationEmailHTML(booking),
      text: BookingController.generateBookingConfirmationEmailText(booking),
    };

    await sendMail(emailData);
  }

  static async sendStatusUpdateEmail(booking, newStatus) {
    const statusMessages = {
      confirmed: "Your booking has been confirmed!",
      cancelled: "Your booking has been cancelled.",
      completed: "Your journey has been completed. Thank you for traveling with us!",
    };

    const emailData = {
      to: booking.contactEmail,
      subject: `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - ${booking.bookingReference}`,
      html: BookingController.generateStatusUpdateEmailHTML(booking, newStatus, statusMessages[newStatus]),
      text: `${statusMessages[newStatus]} Booking Reference: ${booking.bookingReference}`,
    };

    await sendMail(emailData);
  }

  static async sendCancellationEmail(booking, reason) {
    const emailData = {
      to: booking.contactEmail,
      subject: `Booking Cancelled - ${booking.bookingReference}`,
      html: BookingController.generateCancellationEmailHTML(booking, reason),
      text: `Your booking ${booking.bookingReference} has been cancelled. Reason: ${reason}`,
    };

    await sendMail(emailData);
  }

  // Email template generators
  static generateBookingConfirmationEmailHTML(booking) {
    const seatList = booking.seatNumbers.join(", ");
    const passengerList = booking.passengerNames.join(", ");
    
    return `
    <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); border-radius: 12px; padding: 30px; font-family: Arial, sans-serif; color: #333; line-height: 1.6; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
      </div>
      
      <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 10px;">🎉 Booking Confirmed!</h2>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2b6cb0; margin-top: 0;">Booking Details</h3>
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Bus:</strong> ${booking.bus.busNumber} (${booking.bus.busType})</p>
        <p><strong>Route:</strong> ${booking.bus.route.origin} → ${booking.bus.route.destination}</p>
        <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toDateString()}</p>
        <p><strong>Seat Numbers:</strong> ${seatList}</p>
        <p><strong>Passengers:</strong> ${passengerList}</p>
        <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
        <p><strong>Payment Status:</strong> ${booking.paymentStatus.toUpperCase()}</p>
      </div>

      ${booking.boardingPoint ? `<p><strong>Boarding Point:</strong> ${booking.boardingPoint}</p>` : ''}
      ${booking.droppingPoint ? `<p><strong>Dropping Point:</strong> ${booking.droppingPoint}</p>` : ''}
      
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #2b6cb0; margin-top: 0;">Important Information</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Please arrive at the boarding point 15 minutes before departure</li>
          <li>Carry a valid ID proof during travel</li>
          <li>Cancellations allowed up to 2 hours before travel</li>
          <li>Keep this email as your booking confirmation</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666;">For any queries, contact us at support@gobus.com</p>
        <p style="color: #666;"><strong>Safe travels with GoBus!</strong></p>
      </div>
    </div>`;
  }

  static generateBookingConfirmationEmailText(booking) {
    const seatList = booking.seatNumbers.join(", ");
    const passengerList = booking.passengerNames.join(", ");
    
    return `
BOOKING CONFIRMED - ${booking.bookingReference}

Booking Details:
- Bus: ${booking.bus.busNumber} (${booking.bus.busType})
- Route: ${booking.bus.route.origin} to ${booking.bus.route.destination}
- Travel Date: ${new Date(booking.travelDate).toDateString()}
- Seats: ${seatList}
- Passengers: ${passengerList}
- Total Amount: ₹${booking.totalAmount}
- Payment Status: ${booking.paymentStatus.toUpperCase()}

${booking.boardingPoint ? `Boarding Point: ${booking.boardingPoint}` : ''}
${booking.droppingPoint ? `Dropping Point: ${booking.droppingPoint}` : ''}

Important:
- Arrive 15 minutes early at boarding point
- Carry valid ID proof
- Cancellations allowed up to 2 hours before travel

Safe travels with GoBus!
`;
  }

  static generateStatusUpdateEmailHTML(booking, status, message) {
    return `
    <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); border-radius: 12px; padding: 30px; font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
      </div>
      
      <h2 style="color: #2b6cb0; text-align: center;">${message}</h2>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        <p><strong>Route:</strong> ${booking.bus.route.origin} → ${booking.bus.route.destination}</p>
        <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toDateString()}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666;">Thank you for choosing GoBus!</p>
      </div>
    </div>`;
  }

  static generateCancellationEmailHTML(booking, reason) {
    return `
    <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); border-radius: 12px; padding: 30px; font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
      </div>
      
      <h2 style="color: #e53e3e; text-align: center;">Booking Cancelled</h2>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Refund Amount:</strong> ₹${booking.totalAmount}</p>
      </div>

      <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Refund Information:</strong> Your refund will be processed within 5-7 business days to your original payment method.</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666;">We hope to serve you again in the future!</p>
      </div>
    </div>`;
  }
}

export default BookingController;