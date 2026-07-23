const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate");
const { registerSchema, loginSchema, addAddressSchema, updateAddressSchema } = require("./auth.schemas");
const rateLimiter = require("../../middlewares/rateLimiter");
const { authenticate } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/register",
  rateLimiter(15 * 60 * 1000, 10),
  validate(registerSchema),
  authController.register,
);

router.post(
  "/login",
  rateLimiter(15 * 60 * 1000, 10),
  validate(loginSchema),
  authController.login,
);

router.get("/profile", authenticate, authController.getProfile);

router.post("/logout", authenticate, authController.logout);

router.post(
  "/profile/address",
  authenticate,
  validate(addAddressSchema),
  authController.addAddress
);

router.delete("/profile/address/:id", authenticate, authController.deleteAddress);

router.put(
  "/profile/address/:id",
  authenticate,
  validate(updateAddressSchema),
  authController.updateAddress
);

module.exports = router;
