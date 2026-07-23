const express = require("express");
const restaurantController = require("./restaurant.controller");
const validate = require("../../middlewares/validate");
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateStatusSchema,
} = require("./restaurant.schemas");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

// ========================
// OWNER — RESTAURANT
// ========================

router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createRestaurantSchema),
  restaurantController.createRestaurant,
);

router.get(
  "/owner/my",
  authenticate,
  authorize("OWNER"),
  restaurantController.getMyRestaurant,
);

router.put(
  "/owner/my",
  authenticate,
  authorize("OWNER"),
  validate(updateRestaurantSchema),
  restaurantController.updateRestaurant,
);

router.patch(
  "/owner/my/status",
  authenticate,
  authorize("OWNER"),
  validate(updateStatusSchema),
  restaurantController.updateStatus,
);

// ========================
// PUBLIC
// ========================

router.get("/", restaurantController.getAllRestaurants);

router.get("/:slug", restaurantController.getRestaurantBySlug);

module.exports = router;
