const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(50),

  imageUrl: z.string().url("Invalid URL.").optional(),
});

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(50)
    .optional(),

  imageUrl: z.string().url("Invalid URL.").optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
