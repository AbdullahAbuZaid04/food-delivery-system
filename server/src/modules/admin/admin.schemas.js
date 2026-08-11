const { z } = require("zod");

const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]),
});

const updateRestaurantStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "OPEN",
    "CLOSED",
    "SUSPENDED",
    "REJECTED",
  ]),
});

module.exports = {
  updateUserStatusSchema,
  updateRestaurantStatusSchema,
};
