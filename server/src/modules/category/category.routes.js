const express = require("express");
const categoryController = require("./category.controller");
const validate = require("../../middlewares/validate");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("./category.schemas");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

// ========================
// OWNER — CATEGORY
// ========================

router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.get(
  "/my",
  authenticate,
  authorize("OWNER"),
  categoryController.getMyCategories,
);

router.get(
  "/restaurant/:restaurantId",
  categoryController.getCategoriesByRestaurantId,
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER"),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER"),
  categoryController.deleteCategory,
);

module.exports = router;
