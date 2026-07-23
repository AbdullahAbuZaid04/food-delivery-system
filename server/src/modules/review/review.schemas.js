const { z } = require("zod");

const createReviewSchema = z.object({
  orderId: z.string().min(1, "Order is required."),

  rating: z
    .number()
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating must be at most 5."),

  comment: z.string().trim().max(500).optional(),
});

module.exports = {
  createReviewSchema,
};
