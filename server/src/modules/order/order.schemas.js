const { z } = require("zod");

const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required."),

  phone: z.string().regex(/^05\d{8}$/, "Invalid Palestinian phone number."),

  paymentMethod: z.enum(["CASH", "CARD"]).default("CASH"),

  notes: z.string().trim().max(200).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "PREPARING",
    "READY",
    "ASSIGNED",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

const assignDriverSchema = z.object({
  driverId: z.string().min(1, "Driver is required."),
});

module.exports = {
  createOrderSchema,
  updateStatusSchema,
  assignDriverSchema,
};
