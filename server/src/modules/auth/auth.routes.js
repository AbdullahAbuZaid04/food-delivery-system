const express = require("express");
const authController = require("./auth.controller");
const validate = require("./auth.validator");
const { registerSchema, loginSchema } = require("./auth.schemas");
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

module.exports = router;
