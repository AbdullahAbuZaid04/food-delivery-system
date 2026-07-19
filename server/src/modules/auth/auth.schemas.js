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

module.exports = {
  registerSchema,
  loginSchema,
};
