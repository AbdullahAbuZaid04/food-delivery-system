const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

router.get(
  "/",
  authenticate,
  authorize("OWNER"),
  dashboardController.getDashboardStats,
);

module.exports = router;
