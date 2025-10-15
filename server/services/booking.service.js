import Booking from "../model/booking.model.js";
import Bus from "../model/bus.model.js";
import Route from "../model/route.model.js";
import User from "../model/user.model.js";
import { Op } from "sequelize";
import sequelize from "../config/connectdb.js";

class BookingService {
  // Create a new booking with seat validation
  static async createBooking(bookingData, userInfo, requestInfo = {}) {
    const transaction = await sequelize.transaction();

    try {
      const {
        busId,
        seatNumbers,
        travelDate,
        contactPhone,
        contactEmail,
        passengerNames,
        boardingPoint,
        droppingPoint,
        specialRequests,
        paymentMethod,
      } = bookingData;

      // 1. Validate bus exists and is active
      const bus = await Bus.findOne({
        where: { id: busId, isActive: true },
        include: [
          {
            model: Route,
            as: "route",
            attributes: ["id", "routeName", "origin", "destination", "fare"],
          },
        ],
        transaction,
      });

      if (!bus) {
        throw new Error("Bus not found or not active");
      }

      if (!bus.route) {
        throw new Error("Bus route information not found");
      }

      // 2. Check if travel date is valid for this bus
      if (bus.status !== "available") {
        throw new Error(
          `Bus is currently ${bus.status} and not available for booking`
        );
      }

      // 3. Validate seat numbers against bus capacity
      const maxSeat = Math.max(...seatNumbers);
      if (maxSeat > bus.capacity) {
        throw new Error(
          `Seat number ${maxSeat} exceeds bus capacity of ${bus.capacity}`
        );
      }

      // 4. Check seat availability
      const availabilityCheck = await Booking.checkSeatAvailability(
        busId,
        travelDate,
        seatNumbers
      );

      if (!availabilityCheck.available) {
        throw new Error(
          `Seats ${availabilityCheck.unavailableSeats.join(
            ", "
          )} are already booked`
        );
      }

      // 5. Calculate fare
      const farePerSeat = parseFloat(bus.route.fare);
      const baseAmount = seatNumbers.length * farePerSeat;
      const taxAmount = baseAmount * 0.18; // 18% tax
      const totalAmount = baseAmount + taxAmount;

      // 6. Create booking
      const booking = await Booking.create(
        {
          userId: userInfo.id,
          busId,
          seatNumbers,
          travelDate,
          farePerSeat,
          totalAmount,
          contactPhone,
          contactEmail,
          passengerNames,
          boardingPoint,
          droppingPoint,
          specialRequests,
          paymentMethod,
          bookingIP: requestInfo.ip,
          userAgent: requestInfo.userAgent,
          status: "pending",
          paymentStatus: "pending",
        },
        { transaction }
      );

      // 7. Get booking data before committing
      const createdBooking = await Booking.findOne({
        where: { slug: booking.slug },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email"],
          },
          {
            model: Bus,
            as: "bus",
            include: [
              {
                model: Route,
                as: "route",
                attributes: ["id", "origin", "destination", "fare"],
              },
            ],
          },
        ],
        transaction,
      });

      await transaction.commit();

      return createdBooking;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  // Get booking by slug with full details
  static async getBookingBySlug(slug, userId = null) {
    const whereCondition = { slug };
    if (userId) {
      whereCondition.userId = userId;
    }

    const booking = await Booking.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "phoneNumber"],
        },
        {
          model: Bus,
          as: "bus",
          attributes: ["id", "busNumber", "busType", "capacity"],
          include: [
            {
              model: Route,
              as: "route",
              attributes: [
                "id",
                "routeName",
                "origin",
                "destination",
                "fare",
                "distance",
              ],
            },
          ],
        },
      ],
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }

  // Get user bookings with pagination and filters
  static async getUserBookings(userId, options = {}) {
    const { page = 1, limit = 10, status, fromDate, toDate } = options;

    const offset = (page - 1) * limit;
    const where = { userId };

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add date range filter
    if (fromDate || toDate) {
      where.travelDate = {};
      if (fromDate) {
        where.travelDate[Op.gte] = fromDate;
      }
      if (toDate) {
        where.travelDate[Op.lte] = toDate;
      }
    }

    const result = await Booking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Bus,
          as: "bus",
          attributes: ["id", "busNumber", "busType"],
          include: [
            {
              model: Route,
              as: "route",
              attributes: ["routeName", "origin", "destination"],
            },
          ],
        },
      ],
    });

    return {
      bookings: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < result.count,
        hasPrevPage: page > 1,
      },
    };
  }

  // Check seat availability
  static async checkSeatAvailability(busId, travelDate, seatNumbers = []) {
    // Validate bus exists
    const bus = await Bus.findByPk(busId);
    if (!bus) {
      throw new Error("Bus not found");
    }

    const availability = await Booking.checkSeatAvailability(
      busId,
      travelDate,
      seatNumbers
    );

    // Generate seat map
    const seatMap = [];
    for (let i = 1; i <= bus.capacity; i++) {
      seatMap.push({
        seatNumber: i,
        isAvailable: !availability.bookedSeats.includes(i),
        isSelected: seatNumbers.includes(i),
      });
    }

    return {
      ...availability,
      seatMap,
      busCapacity: bus.capacity,
      totalBookedSeats: availability.bookedSeats.length,
      totalAvailableSeats: bus.capacity - availability.bookedSeats.length,
    };
  }

  // Update booking status
  static async updateBookingStatus(slug, statusData, userInfo) {
    const { status, paymentStatus, paymentMethod, cancellationReason } =
      statusData;

    const booking = await Booking.findOne({ where: { slug } });
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Security check: users can only update their own bookings (unless admin)
    if (userInfo.role !== "admin" && booking.userId !== userInfo.id) {
      throw new Error("Unauthorized: You can only update your own bookings");
    }

    // Validate status transitions
    if (status) {
      const validTransitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
        cancelled: [], // Cannot change from cancelled
        completed: [], // Cannot change from completed
      };

      if (!validTransitions[booking.status].includes(status)) {
        throw new Error(
          `Cannot change status from ${booking.status} to ${status}`
        );
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    const updatedBooking = await booking.update(updateData);
    return await this.getBookingBySlug(updatedBooking.slug);
  }

  // Cancel booking with validation
  static async cancelBooking(slug, userId, reason = "User cancellation") {
    const booking = await Booking.findOne({ where: { slug } });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Use static method from model for security checks
    const cancelledBooking = await Booking.cancelBooking(slug, userId, reason);
    return await this.getBookingBySlug(cancelledBooking.slug);
  }

  // Get booking statistics for admin
  static async getBookingStats(dateRange = {}) {
    const { fromDate, toDate } = dateRange;
    const where = {};

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt[Op.gte] = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt[Op.lte] = new Date(toDate);
      }
    }

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue,
    ] = await Promise.all([
      Booking.count({ where }),
      Booking.count({ where: { ...where, status: "confirmed" } }),
      Booking.count({ where: { ...where, status: "cancelled" } }),
      Booking.count({ where: { ...where, status: "pending" } }),
      Booking.sum("totalAmount", {
        where: { ...where, paymentStatus: "paid" },
      }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      completedBookings: await Booking.count({
        where: { ...where, status: "completed" },
      }),
      totalRevenue: totalRevenue || 0,
      cancellationRate:
        totalBookings > 0
          ? ((cancelledBookings / totalBookings) * 100).toFixed(2)
          : 0,
      confirmationRate:
        totalBookings > 0
          ? ((confirmedBookings / totalBookings) * 100).toFixed(2)
          : 0,
    };
  }

  // Get popular routes based on bookings
  static async getPopularRoutes(limit = 10) {
    const popularRoutes = await Booking.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("booking.id")), "bookingCount"],
        [
          sequelize.fn("SUM", sequelize.col("booking.totalAmount")),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: Bus,
          as: "bus",
          attributes: [],
          include: [
            {
              model: Route,
              as: "route",
              attributes: ["id", "routeName", "origin", "destination"],
            },
          ],
        },
      ],
      group: ["bus.route.id"],
      order: [[sequelize.fn("COUNT", sequelize.col("booking.id")), "DESC"]],
      limit,
      having: sequelize.where(
        sequelize.fn("COUNT", sequelize.col("booking.id")),
        Op.gt,
        0
      ),
    });

    return popularRoutes.map((booking) => ({
      route: booking.bus.route,
      bookingCount: parseInt(booking.dataValues.bookingCount),
      totalRevenue: parseFloat(booking.dataValues.totalRevenue || 0),
    }));
  }

  // Bulk update bookings (admin only)
  static async bulkUpdateBookings(bookingSlugs, updates) {
    const transaction = await sequelize.transaction();

    try {
      const bookings = await Booking.findAll({
        where: { slug: { [Op.in]: bookingSlugs } },
        transaction,
      });

      if (bookings.length !== bookingSlugs.length) {
        throw new Error("Some bookings not found");
      }

      const updatedBookings = await Promise.all(
        bookings.map((booking) => booking.update(updates, { transaction }))
      );

      await transaction.commit();
      return updatedBookings;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get bookings by bus and date (for driver/admin)
  static async getBookingsByBusAndDate(busId, travelDate) {
    const bookings = await Booking.findAll({
      where: {
        busId,
        travelDate,
        status: { [Op.in]: ["confirmed", "pending", "completed"] },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "phoneNumber"],
        },
      ],
      order: [["seatNumbers", "ASC"]],
    });

    const summary = {
      totalBookings: bookings.length,
      totalPassengers: bookings.reduce(
        (sum, booking) => sum + booking.seatNumbers.length,
        0
      ),
      confirmedBookings: bookings.filter((b) => b.status === "confirmed")
        .length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
      totalRevenue: bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0),
    };

    return {
      bookings,
      summary,
    };
  }
}

export default BookingService;
