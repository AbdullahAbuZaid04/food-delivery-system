const { Router } = require("express");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const adminController = require("./admin.controller");
const validate = require("../../middlewares/validate");
const {
  updateUserStatusSchema,
  updateRestaurantStatusSchema,
} = require("./admin.schemas");

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

// Users
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch(
  "/users/:id/status",
  validate(updateUserStatusSchema),
  adminController.updateUserStatus
);

// Restaurants
router.get("/restaurants", adminController.getRestaurants);
router.get("/restaurants/:id", adminController.getRestaurantById);
router.patch(
  "/restaurants/:id/status",
  validate(updateRestaurantStatusSchema),
  adminController.updateRestaurantStatus
);

module.exports = router;
