const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate");
const { registerSchema, loginSchema, refreshTokenSchema, addAddressSchema, updateAddressSchema, updateProfileSchema } = require("./auth.schemas");
const rateLimiter = require("../../middlewares/rateLimiter");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

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

router.post(
  "/refresh",
  rateLimiter(15 * 60 * 1000, 10),
  validate(refreshTokenSchema),
  authController.refresh,
);

router.get("/profile", authenticate, authController.getProfile);

router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile
);

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

// Driver re-application: only DRIVER users, rejected applications go back into
// the admin review queue (PENDING).
router.patch(
  "/driver/reapply",
  authenticate,
  authorize("DRIVER"),
  authController.reapplyAsDriver
);

module.exports = router;
