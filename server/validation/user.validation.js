import z from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(30),
  role: z.enum(["user", "admin", "busDriver"]).optional(),
  isVerified: z.boolean().optional(),
  phoneNumber: z.string().optional(),
});

// Assign user to bus driver role validation
export const assignDriverRoleSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  licenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters")
    .optional(),
  licenseExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  experience: z
    .number()
    .int()
    .min(0, "Experience must be 0 or more years")
    .optional(),
  notes: z.string().max(50, "Notes must be at most 50 characters").optional(),
});

// Update user role validation
export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "busDriver"], {
    errorMap: () => ({
      message: "Role must be one of: user, admin, busDriver",
    }),
  }),
  reason: z
    .string()
    .max(20, "Reason must be at most 20 characters")
    .optional(),
});
