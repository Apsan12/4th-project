import { z } from "zod";

// Validation for creating a new booking
export const createBookingSchema = z
  .object({
    body: z.object({
      busId: z.number().int().positive("Bus ID must be a positive integer"),

      seatNumbers: z
        .array(z.number().int().positive("Seat number must be positive"))
        .min(1, "At least one seat must be selected")
        .max(6, "Maximum 6 seats can be booked at once")
        .refine((seats) => new Set(seats).size === seats.length, {
          message: "Duplicate seat numbers are not allowed",
        }),

      travelDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Travel date must be in YYYY-MM-DD format"
        )
        .refine(
          (date) => {
            const travelDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return travelDate >= today;
          },
          {
            message: "Travel date must be today or in the future",
          }
        ),

      contactPhone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .regex(/^[\d\+\-\(\)\s]+$/, "Invalid phone number format"),

      contactEmail: z
        .string()
        .email("Invalid email format")
        .max(100, "Email must be at most 100 characters"),

      passengerNames: z
        .array(
          z
            .string()
            .min(2, "Passenger name must be at least 2 characters")
            .max(50, "Passenger name must be at most 50 characters")
        )
        .min(1, "At least one passenger name is required"),

      boardingPoint: z
        .string()
        .max(200, "Boarding point must be at most 200 characters")
        .optional(),

      droppingPoint: z
        .string()
        .max(200, "Dropping point must be at most 200 characters")
        .optional(),

      specialRequests: z
        .string()
        .max(500, "Special requests must be at most 500 characters")
        .optional(),

      paymentMethod: z
        .string()
        .trim()
        .toLowerCase()
        .refine(
          (val) => {
            const validMethods = ["cash", "card", "upi", "wallet"];
            return validMethods.includes(val);
          },
          {
            message:
              "Invalid payment method. Valid options are: cash, card, upi, wallet. Note: 'pending' is not a payment method - it's a payment status.",
          }
        )
        .optional(),
    }),
  })
  .refine(
    (data) => {
      const seatCount = data.body.seatNumbers?.length || 0;
      const passengerCount = data.body.passengerNames?.length || 0;
      return seatCount === passengerCount;
    },
    {
      message: "Number of passenger names must match number of seats",
      path: ["body", "passengerNames"],
    }
  );

// Validation for updating booking status
export const updateBookingStatusSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(1, "Booking slug is required")
      .max(50, "Invalid booking slug"),
  }),
  body: z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    paymentMethod: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => ["cash", "card", "upi", "wallet"].includes(val), {
        message: "Payment method must be one of: cash, card, upi, wallet",
      })
      .optional(),
    cancellationReason: z
      .string()
      .max(50, "Cancellation reason must be at most 50 characters")
      .optional(),
  }),
});

// Validation for cancelling booking
export const cancelBookingSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(1, "Booking slug is required")
      .max(50, "Invalid booking slug"),
  }),
  body: z.object({
    reason: z
      .string()
      .min(5, "Cancellation reason must be at least 5 characters")
      .max(500, "Cancellation reason must be at most 500 characters")
      .optional()
      .default("User cancellation"),
  }),
});

// Validation for getting user bookings
export const getUserBookingsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number")
      .transform(Number)
      .refine((val) => val >= 1, "Page must be at least 1")
      .optional()
      .default("1"),

    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine(
        (val) => val >= 1 && val <= 100,
        "Limit must be between 1 and 100"
      )
      .optional()
      .default("10"),

    status: z
      .enum(["pending", "confirmed", "cancelled", "completed"])
      .optional(),

    fromDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be in YYYY-MM-DD format")
      .optional(),

    toDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be in YYYY-MM-DD format")
      .optional(),
  }),
});

// Validation for checking seat availability
export const checkSeatAvailabilitySchema = z.object({
  query: z.object({
    busId: z
      .string()
      .regex(/^\d+$/, "Bus ID must be a number")
      .transform(Number),

    travelDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Travel date must be in YYYY-MM-DD format")
      .refine(
        (date) => {
          const travelDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return travelDate >= today;
        },
        {
          message: "Travel date must be today or in the future",
        }
      ),

    seatNumbers: z
      .string()
      .optional()
      .transform((str) => {
        if (!str) return [];
        return str.split(",").map((seat) => {
          const num = parseInt(seat.trim());
          if (isNaN(num) || num < 1) {
            throw new Error("Invalid seat number");
          }
          return num;
        });
      }),
  }),
});

// Validation for getting booking by slug
export const getBookingBySlugSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(1, "Booking slug is required")
      .max(50, "Invalid booking slug"),
  }),
});

// Validation for admin operations
export const adminUpdateBookingSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(1, "Booking slug is required")
      .max(50, "Invalid booking slug"),
  }),
  body: z.object({
    status: z
      .enum(["pending", "confirmed", "cancelled", "completed"])
      .optional(),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    paymentMethod: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => ["cash", "card", "upi", "wallet"].includes(val), {
        message: "Payment method must be one of: cash, card, upi, wallet",
      })
      .optional(),
    contactPhone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits")
      .regex(/^[\d\+\-\(\)\s]+$/, "Invalid phone number format")
      .optional(),
    contactEmail: z
      .string()
      .email("Invalid email format")
      .max(100, "Email must be at most 100 characters")
      .optional(),
    boardingPoint: z
      .string()
      .max(200, "Boarding point must be at most 200 characters")
      .optional(),
    droppingPoint: z
      .string()
      .max(200, "Dropping point must be at most 200 characters")
      .optional(),
    specialRequests: z
      .string()
      .max(500, "Special requests must be at most 500 characters")
      .optional(),
    cancellationReason: z
      .string()
      .max(500, "Cancellation reason must be at most 500 characters")
      .optional(),
  }),
});

// Validation for bulk operations
export const bulkUpdateBookingsSchema = z.object({
  body: z.object({
    bookingSlugs: z
      .array(z.string().min(1, "Booking slug is required"))
      .min(1, "At least one booking slug is required")
      .max(50, "Maximum 50 bookings can be updated at once"),

    updates: z.object({
      status: z
        .enum(["pending", "confirmed", "cancelled", "completed"])
        .optional(),
      paymentStatus: z
        .enum(["pending", "paid", "failed", "refunded"])
        .optional(),
    }),
  }),
});

// Export validation middleware
export const validateCreateBooking = (req, res, next) => {
  try {
    console.log(
      "Validating booking request:",
      JSON.stringify(req.body, null, 2)
    );

    const result = createBookingSchema.safeParse(req);
    if (!result.success) {
      console.error(
        "Validation error details:",
        JSON.stringify(result.error, null, 2)
      );
      console.error("Request body:", JSON.stringify(req.body, null, 2));

      const errors = result.error.errors || result.error.issues || [];

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.map((err) => ({
          field: err.path ? err.path.join(".") : "unknown",
          message: err.message || "Validation error",
          received: err.received || "undefined",
        })),
      });
    }

    // console.log("Validation passed successfully");
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: [
        {
          field: "unknown",
          message: error.message || "Validation error",
        },
      ],
    });
  }
};

export const validateUpdateBookingStatus = (req, res, next) => {
  try {
    updateBookingStatusSchema.parse(req);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};

export const validateCancelBooking = (req, res, next) => {
  try {
    cancelBookingSchema.parse(req);
    next();
  } catch (error) {
    // console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};

export const validateGetUserBookings = (req, res, next) => {
  try {
    getUserBookingsSchema.parse(req);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};

export const validateCheckSeatAvailability = (req, res, next) => {
  try {
    checkSeatAvailabilitySchema.parse(req);
    next();
  } catch (error) {
    // console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};

export const validateGetBookingBySlug = (req, res, next) => {
  try {
    getBookingBySlugSchema.parse(req);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};

export const validateAdminUpdateBooking = (req, res, next) => {
  try {
    adminUpdateBookingSchema.parse(req);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};

export const validateBulkUpdateBookings = (req, res, next) => {
  try {
    bulkUpdateBookingsSchema.parse(req);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors
        ? error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        : [{ field: "unknown", message: error.message || "Validation error" }],
    });
  }
};
