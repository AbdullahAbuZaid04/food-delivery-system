const { z } = require("zod");

const addItemSchema = z.object({
  mealId: z.string().min(1, "Meal is required."),

  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .default(1),

  notes: z.string().trim().max(200).optional(),
});

const updateItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, "Quantity must be at least 0."),
});

module.exports = {
  addItemSchema,
  updateItemSchema,
};
