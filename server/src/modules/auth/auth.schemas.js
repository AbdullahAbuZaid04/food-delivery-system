const { z } = require("zod");

const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50),

  email: z.email("Invalid email address.").toLowerCase(),

  phone: z.string().regex(/^05\d{8}$/, "Invalid Palestinian phone number."),

  password: z.string().min(8, "Password must be at least 8 characters."),

  role: z.enum(["CUSTOMER", "OWNER", "DRIVER"]).default("CUSTOMER"),
});

const loginSchema = z.object({
  email: z.email("Invalid email address.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const addAddressSchema = z.object({
  label: z.string().trim().min(1, "Label is required."),
  city: z.string().trim().min(1, "City is required."),
  street: z.string().trim().min(1, "Street is required."),
  building: z.string().trim().optional(),
  details: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  addAddressSchema,
};
