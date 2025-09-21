import { z } from "zod";

// Create Route Validation Schema
export const createRouteSchema = z.object({
  routeCode: z
    .string()
    .min(2, "Route code must be at least 2 characters")
    .max(20, "Route code must be at most 20 characters")
    .regex(
      /^[A-Z0-9-_]+$/,
      "Route code must contain only uppercase letters, numbers, hyphens, and underscores"
    ),

  routeName: z
    .string()
    .min(3, "Route name must be at least 3 characters")
    .max(100, "Route name must be at most 100 characters")
    .trim(),

  origin: z
    .string()
    .min(2, "Origin must be at least 2 characters")
    .max(50, "Origin must be at most 50 characters")
    .trim(),

  destination: z
    .string()
    .min(2, "Destination must be at least 2 characters")
    .max(50, "Destination must be at most 50 characters")
    .trim(),

  distance: z
    .number()
    .positive("Distance must be positive")
    .max(10000, "Distance cannot exceed 10,000 km")
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      "Distance can have at most 2 decimal places"
    ),

  estimatedDuration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(2880, "Duration cannot exceed 48 hours (2880 minutes)"),

  fare: z
    .number()
    .positive("Fare must be positive")
    .max(100000, "Fare cannot exceed 100,000")
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      "Fare can have at most 2 decimal places"
    ),

  stops: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Stop name is required")
          .max(50, "Stop name too long"),
        order: z.number().int().positive("Order must be a positive integer"),
        estimatedArrival: z.string().optional(), // Time in HH:MM format
      })
    )
    .optional()
    .default([]),

  isActive: z.boolean().optional().default(true),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

// Update Route Validation Schema
export const updateRouteSchema = z
  .object({
    routeCode: z
      .string()
      .min(2, "Route code must be at least 2 characters")
      .max(20, "Route code must be at most 20 characters")
      .regex(
        /^[A-Z0-9-_]+$/,
        "Route code must contain only uppercase letters, numbers, hyphens, and underscores"
      )
      .optional(),

    routeName: z
      .string()
      .min(3, "Route name must be at least 3 characters")
      .max(100, "Route name must be at most 100 characters")
      .trim()
      .optional(),

    origin: z
      .string()
      .min(2, "Origin must be at least 2 characters")
      .max(50, "Origin must be at most 50 characters")
      .trim()
      .optional(),

    destination: z
      .string()
      .min(2, "Destination must be at least 2 characters")
      .max(50, "Destination must be at most 50 characters")
      .trim()
      .optional(),

    distance: z
      .number()
      .positive("Distance must be positive")
      .max(10000, "Distance cannot exceed 10,000 km")
      .refine(
        (val) => Number(val.toFixed(2)) === val,
        "Distance can have at most 2 decimal places"
      )
      .optional(),

    estimatedDuration: z
      .number()
      .int("Duration must be a whole number")
      .min(1, "Duration must be at least 1 minute")
      .max(2880, "Duration cannot exceed 48 hours (2880 minutes)")
      .optional(),

    fare: z
      .number()
      .positive("Fare must be positive")
      .max(100000, "Fare cannot exceed 100,000")
      .refine(
        (val) => Number(val.toFixed(2)) === val,
        "Fare can have at most 2 decimal places"
      )
      .optional(),

    stops: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, "Stop name is required")
            .max(50, "Stop name too long"),
          order: z.number().int().positive("Order must be a positive integer"),
          estimatedArrival: z.string().optional(),
        })
      )
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

// Route Query Validation Schema
export const routeQuerySchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Route ID Validation Schema
export const routeIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Route ID must be a valid number")
    .transform(Number),
});
