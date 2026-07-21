const { z } = require("zod");

const createMealSchema = z.object({
  categoryId: z.string().min(1, "Category is required."),

  name: z.string().trim().min(1, "Meal name is required.").max(100),

  description: z.string().trim().max(500).optional(),

  imageUrl: z.string().url("Invalid URL.").optional(),

  price: z.number().min(0.01, "Price must be greater than 0."),

  preparationTime: z
    .number()
    .int()
    .min(1, "Preparation time must be at least 1 minute.")
    .optional(),

  isFeatured: z.boolean().default(false),
});

const updateMealSchema = z.object({
  categoryId: z.string().min(1, "Category is required.").optional(),

  name: z.string().trim().min(1, "Meal name is required.").max(100).optional(),

  description: z.string().trim().max(500).optional(),

  imageUrl: z.string().url("Invalid URL.").optional(),

  price: z.number().min(0.01, "Price must be greater than 0.").optional(),

  preparationTime: z
    .number()
    .int()
    .min(1, "Preparation time must be at least 1 minute.")
    .optional(),

  isFeatured: z.boolean().optional(),
});

module.exports = {
  createMealSchema,
  updateMealSchema,
};
