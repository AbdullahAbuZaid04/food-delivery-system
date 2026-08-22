const { Router } = require("express");
const { authenticate } = require("../../middlewares/auth.middleware");
const reviewController = require("./review.controller");
const validate = require("../../middlewares/validate");
const { createReviewSchema } = require("./review.schemas");

const router = Router();

// PUBLIC — restaurant reviews (paginated)
router.get("/restaurant/:restaurantId", reviewController.getReviewsByRestaurant);

// AUTHENTICATED
router.use(authenticate);

// Get my reviews
router.get("/my", reviewController.getMyReviews);

// Create review
router.post("/", validate(createReviewSchema), reviewController.createReview);

// Delete review
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
