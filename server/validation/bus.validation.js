import { z } from "zod";

// Create Bus Validation Schema
export const createBusSchema = z.object({
  busNumber: z
    .string()
    .min(3, "Bus number must be at least 3 characters")
    .max(20, "Bus number must be at most 20 characters")
    .regex(
      /^[A-Z0-9-_]+$/,
      "Bus number must contain only uppercase letters, numbers, hyphens, and underscores"
    )
    .trim(),

  busType: z
    .enum(["standard", "luxury", "semi-luxury", "sleeper"], {
      errorMap: () => ({
        message:
          "Bus type must be one of: standard, luxury, semi-luxury, sleeper",
      }),
    })
    .default("standard"),

  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(100, "Capacity cannot exceed 100"),

  routeId: z
    .number()
    .int("Route ID must be a valid integer")
    .positive("Route ID must be positive"),

  driverId: z
    .number()
    .int("Driver ID must be a valid integer")
    .positive("Driver ID must be positive")
    .optional()
    .nullable(),

  status: z
    .enum(["available", "in-transit", "maintenance", "out-of-service"], {
      errorMap: () => ({
        message:
          "Status must be one of: available, in-transit, maintenance, out-of-service",
      }),
    })
    .default("available"),

  licensePlate: z
    .string()
    .min(5, "License plate must be at least 5 characters")
    .max(15, "License plate must be at most 15 characters")
    .regex(
      /^[A-Z0-9-\s]+$/,
      "License plate must contain only uppercase letters, numbers, hyphens, and spaces"
    )
    .trim(),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

export const updateBusSchema = z
  .object({
    busNumber: z
      .string()
      .min(3, "Bus number must be at least 3 characters")
      .max(20, "Bus number must be at most 20 characters")
      .regex(
        /^[A-Z0-9-_]+$/,
        "Bus number must contain only uppercase letters, numbers, hyphens, and underscores"
      )
      .trim()
      .optional(),

    busType: z
      .enum(["standard", "luxury", "semi-luxury", "sleeper"], {
        errorMap: () => ({
          message:
            "Bus type must be one of: standard, luxury, semi-luxury, sleeper",
        }),
      })
      .optional(),

    capacity: z
      .number()
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1")
      .max(100, "Capacity cannot exceed 100")
      .optional(),

    routeId: z
      .number()
      .int("Route ID must be a valid integer")
      .positive("Route ID must be positive")
      .optional(),

    driverId: z
      .number()
      .int("Driver ID must be a valid integer")
      .positive("Driver ID must be positive")
      .optional()
      .nullable(),

    status: z
      .enum(["available", "in-transit", "maintenance", "out-of-service"], {
        errorMap: () => ({
          message:
            "Status must be one of: available, in-transit, maintenance, out-of-service",
        }),
      })
      .optional(),

    model: z
      .string()
      .min(2, "Model must be at least 2 characters")
      .max(50, "Model must be at most 50 characters")
      .trim()
      .optional(),

    manufacturer: z
      .string()
      .min(2, "Manufacturer must be at least 2 characters")
      .max(50, "Manufacturer must be at most 50 characters")
      .trim()
      .optional(),

    yearOfManufacture: z
      .number()
      .int("Year must be a whole number")
      .min(1950, "Year cannot be before 1950")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
      .optional(),

    lastMaintenanceDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .refine((date) => {
        const parsedDate = new Date(date);
        return parsedDate <= new Date();
      }, "Last maintenance date cannot be in the future")
      .optional(),

    nextMaintenanceDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .refine((date) => {
        const parsedDate = new Date(date);
        return parsedDate >= new Date();
      }, "Next maintenance date cannot be in the past")
      .optional(),

    isActive: z.boolean().optional(),

    description: z
      .string()
      .max(500, "Description must be at most 500 characters")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

// Bus Query Validation Schema
export const busQuerySchema = z.object({
  routeId: z.string().regex(/^\d+$/).transform(Number).optional(),
  driverId: z.string().regex(/^\d+$/).transform(Number).optional(),
  busType: z.enum(["standard", "luxury", "semi-luxury", "sleeper"]).optional(),
  status: z
    .enum(["available", "in-transit", "maintenance", "out-of-service"])
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Bus ID Validation Schema
export const busIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Bus ID must be a valid number")
    .transform(Number),
});

// Bus Assignment Validation Schema
export const busAssignmentSchema = z.object({
  busId: z
    .number()
    .int("Bus ID must be a valid integer")
    .positive("Bus ID must be positive"),

  routeId: z
    .number()
    .int("Route ID must be a valid integer")
    .positive("Route ID must be positive")
    .optional(),

  driverId: z
    .number()
    .int("Driver ID must be a valid integer")
    .positive("Driver ID must be positive")
    .optional()
    .nullable(),
});

// Bus Status Update Validation Schema
export const busStatusUpdateSchema = z.object({
  status: z.enum(["available", "in-transit", "maintenance", "out-of-service"], {
    errorMap: () => ({
      message:
        "Status must be one of: available, in-transit, maintenance, out-of-service",
    }),
  }),
  reason: z
    .string()
    .max(200, "Reason must be at most 200 characters")
    .optional(),
});
