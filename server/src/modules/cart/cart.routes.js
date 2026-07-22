const express = require("express");
const cartController = require("./cart.controller");
const validate = require("./cart.validator");
const { addItemSchema, updateItemSchema } = require("./cart.schemas");
const { authenticate } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/items", validate(addItemSchema), cartController.addItem);

router.get("/", cartController.getCart);

router.put(
  "/items/:mealId",
  validate(updateItemSchema),
  cartController.updateItem,
);

router.delete("/items/:mealId", cartController.removeItem);

router.delete("/", cartController.clearCart);

module.exports = router;
