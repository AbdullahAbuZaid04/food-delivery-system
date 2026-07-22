const express = require("express");
const orderController = require("./order.controller");
const validate = require("./order.validator");
const {
  createOrderSchema,
  updateStatusSchema,
  assignDriverSchema,
} = require("./order.schemas");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize("CUSTOMER"),
  validate(createOrderSchema),
  orderController.createOrder
);

router.get("/my", authorize("CUSTOMER"), orderController.getMyOrders);

router.get(
  "/restaurant/my",
  authorize("OWNER"),
  orderController.getRestaurantOrders
);

router.get("/:id", orderController.getOrderById);

router.patch(
  "/:id/status",
  authorize("OWNER"),
  validate(updateStatusSchema),
  orderController.updateOrderStatus
);

router.patch(
  "/:id/assign",
  authorize("OWNER"),
  validate(assignDriverSchema),
  orderController.assignDriver
);

module.exports = router;
