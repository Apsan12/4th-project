import sequelize from "../config/connectdb.js";
import { DataTypes, Model } from "sequelize";
import { nanoid } from "nanoid";
import crypto from "crypto";

class Booking extends Model {
  // Generate unique booking slug
  static generateSlug() {
    return `BK-${nanoid(10)}-${Date.now().toString(36).toUpperCase()}`;
  }

  // Generate booking reference
  static generateReference() {
    return crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  // Static methods for booking operations
  static async findBySlug(slug) {
    return await Booking.findOne({
      where: { slug },
      include: [
        {
          association: "user",
          attributes: ["id", "username", "email", "phone"],
        },
        {
          association: "bus",
          include: [
            {
              association: "route",
              attributes: ["routeName", "origin", "destination", "fare"],
            },
          ],
        },
      ],
    });
  }

  static async findByUser(userId, options = {}) {
    const { limit = 10, offset = 0, status } = options;
    const where = { userId };

    if (status) {
      where.status = status;
    }

    return await Booking.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          association: "bus",
          include: [
            {
              association: "route",
              attributes: ["routeName", "origin", "destination", "fare"],
            },
          ],
        },
      ],
    });
  }

  static async findByBus(busId, travelDate) {
    return await Booking.findAll({
      where: {
        busId,
        travelDate,
        status: ["confirmed", "pending"],
      },
      attributes: ["seatNumbers", "status", "slug"],
    });
  }

  // Check seat availability
  static async checkSeatAvailability(busId, travelDate, seatNumbers) {
    const existingBookings = await Booking.findAll({
      where: {
        busId,
        travelDate,
        status: ["confirmed", "pending"],
      },
      attributes: ["seatNumbers"],
    });

    const bookedSeats = new Set();
    existingBookings.forEach((booking) => {
      if (booking.seatNumbers && Array.isArray(booking.seatNumbers)) {
        booking.seatNumbers.forEach((seat) => bookedSeats.add(seat));
      }
    });

    const requestedSeats = Array.isArray(seatNumbers)
      ? seatNumbers
      : [seatNumbers];
    const unavailableSeats = requestedSeats.filter((seat) =>
      bookedSeats.has(seat)
    );

    return {
      available: unavailableSeats.length === 0,
      unavailableSeats,
      bookedSeats: Array.from(bookedSeats),
    };
  }

  // Cancel booking with security checks
  static async cancelBooking(slug, userId, reason = "User cancellation") {
    const booking = await Booking.findOne({
      where: { slug },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized: You can only cancel your own bookings");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    if (booking.status === "completed") {
      throw new Error("Cannot cancel completed booking");
    }

    // Check if travel date is in the future
    const travelDate = new Date(booking.travelDate);
    const now = new Date();
    const hoursDifference = (travelDate - now) / (1000 * 60 * 60);

    if (hoursDifference < 2) {
      throw new Error("Cannot cancel booking less than 2 hours before travel");
    }

    return await booking.update({
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date(),
    });
  }

  // Instance methods
  getTotalAmount() {
    const baseAmount = this.seatNumbers
      ? this.seatNumbers.length * this.farePerSeat
      : 0;
    const taxes = baseAmount * 0.18; // 18% tax
    return baseAmount + taxes;
  }

  getBookingAge() {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now - created) / (1000 * 60)); // Age in minutes
  }

  canBeCancelled() {
    if (this.status === "cancelled" || this.status === "completed") {
      return false;
    }

    const travelDate = new Date(this.travelDate);
    const now = new Date();
    const hoursDifference = (travelDate - now) / (1000 * 60 * 60);

    return hoursDifference >= 2;
  }
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    slug: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      defaultValue: () => Booking.generateSlug(),
    },
    bookingReference: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      defaultValue: () => Booking.generateReference(),
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    busId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "buses",
        key: "id",
      },
    },
    seatNumbers: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidSeats(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("At least one seat must be selected");
          }
          if (value.length > 6) {
            throw new Error("Maximum 6 seats can be booked at once");
          }
          // Validate seat numbers are positive integers
          value.forEach((seat) => {
            if (!Number.isInteger(seat) || seat < 1) {
              throw new Error("Invalid seat number");
            }
          });
        },
      },
    },
    travelDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: {
          args: new Date().toISOString().split("T")[0],
          msg: "Travel date must be in the future",
        },
      },
    },
    farePerSeat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "upi", "wallet"),
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        len: [10, 15],
      },
    },
    contactEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    passengerNames: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidNames(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Passenger names are required");
          }
          value.forEach((name) => {
            if (typeof name !== "string" || name.trim().length < 2) {
              throw new Error("Invalid passenger name");
            }
          });
        },
      },
    },
    boardingPoint: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    droppingPoint: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Security and audit fields
    bookingIP: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    securityHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Booking",
    tableName: "bookings",
    timestamps: true,
    indexes: [
      {
        fields: ["slug"],
        unique: true,
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["busId"],
      },
      {
        fields: ["travelDate"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["bookingReference"],
        unique: true,
      },
    ],
    hooks: {
      beforeCreate: (booking) => {
        // Calculate total amount including taxes
        const baseAmount = booking.seatNumbers.length * booking.farePerSeat;
        booking.totalAmount = baseAmount + baseAmount * 0.18; // 18% tax

        // Generate security hash
        booking.securityHash = crypto
          .createHash("sha256")
          .update(`${booking.slug}-${booking.userId}-${booking.busId}`)
          .digest("hex");
      },
      beforeUpdate: (booking) => {
        if (booking.changed("status") && booking.status === "confirmed") {
          booking.confirmedAt = new Date();
        }
      },
    },
  }
);

export default Booking;
