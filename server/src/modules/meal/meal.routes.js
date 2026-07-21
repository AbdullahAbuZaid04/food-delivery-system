const express = require("express");
const mealController = require("./meal.controller");
const validate = require("./meal.validator");
const {
  createMealSchema,
  updateMealSchema,
} = require("./meal.schemas");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

// ========================
// OWNER — MEAL
// ========================

router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createMealSchema),
  mealController.createMeal
);

router.get(
  "/my",
  authenticate,
  authorize("OWNER"),
  mealController.getMyMeals
);

router.get(
  "/restaurant/:restaurantId",
  mealController.getMealsByRestaurantId
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER"),
  validate(updateMealSchema),
  mealController.updateMeal
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER"),
  mealController.deleteMeal
);

router.patch(
  "/:id/feature",
  authenticate,
  authorize("OWNER"),
  mealController.toggleFeatured
);

module.exports = router;
