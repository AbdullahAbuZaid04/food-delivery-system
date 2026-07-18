const express = require("express");
const authController = require("./auth.controller");
const validate = require("./auth.validator");
const { registerSchema } = require("./auth.schemas");
const rateLimiter = require("../../middlewares/rateLimiter");

const router = express.Router();

router.post(
  "/register",
  rateLimiter(15 * 60 * 1000, 10),
  validate(registerSchema),
  authController.register,
);

module.exports = router;
