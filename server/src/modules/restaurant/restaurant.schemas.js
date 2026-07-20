const { z } = require("zod");

const createRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100),

  description: z.string().trim().max(500).optional(),

  phone: z.string().regex(/^05\d{8}$/, "Invalid Palestinian phone number."),

  email: z.email("Invalid email address.").toLowerCase().optional(),

  logoUrl: z.string().url("Invalid URL.").optional(),

  coverImageUrl: z.string().url("Invalid URL.").optional(),

  deliveryFee: z
    .number()
    .min(0, "Delivery fee must be at least 0.")
    .default(0),

  minimumOrder: z
    .number()
    .min(0, "Minimum order must be at least 0.")
    .default(0),

  estimatedDeliveryTime: z
    .number()
    .int()
    .min(1, "Estimated delivery time must be at least 1 minute.")
    .optional(),

  address: z.object({
    label: z.string().trim().min(1, "Label is required."),
    city: z.string().trim().min(1, "City is required."),
    street: z.string().trim().min(1, "Street is required."),
    building: z.string().trim().optional(),
    details: z.string().trim().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
});

const updateRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100)
    .optional(),

  description: z.string().trim().max(500).optional(),

  phone: z
    .string()
    .regex(/^05\d{8}$/, "Invalid Palestinian phone number.")
    .optional(),

  email: z.email("Invalid email address.").toLowerCase().optional(),

  logoUrl: z.string().url("Invalid URL.").optional(),

  coverImageUrl: z.string().url("Invalid URL.").optional(),

  deliveryFee: z.number().min(0, "Delivery fee must be at least 0.").optional(),

  minimumOrder: z
    .number()
    .min(0, "Minimum order must be at least 0.")
    .optional(),

  estimatedDeliveryTime: z
    .number()
    .int()
    .min(1, "Estimated delivery time must be at least 1 minute.")
    .optional(),

  address: z
    .object({
      label: z.string().trim().min(1, "Label is required.").optional(),
      city: z.string().trim().min(1, "City is required.").optional(),
      street: z.string().trim().min(1, "Street is required.").optional(),
      building: z.string().trim().optional(),
      details: z.string().trim().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    })
    .optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "SUSPENDED"]),
});

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateStatusSchema,
};
