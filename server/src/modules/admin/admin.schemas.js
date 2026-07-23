const { z } = require("zod");

const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]),
});

const updateRestaurantStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "SUSPENDED"]),
});

module.exports = {
  updateUserStatusSchema,
  updateRestaurantStatusSchema,
};
