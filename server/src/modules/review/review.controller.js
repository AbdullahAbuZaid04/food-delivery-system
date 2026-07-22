const reviewService = require("./review.service");

const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.validatedData;
    const orderId = req.validatedData.orderId;

    const review = await reviewService.createReview(
      req.user.id,
      orderId,
      rating,
      comment,
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully.",
      data: review,
    });
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.message.includes("already reviewed")) {
      return res.status(409).json({ success: false, message: error.message });
    }

    if (
      error.message.includes("not found") ||
      error.message.includes("delivered") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    next(error);
  }
};

const getReviewsByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getReviewsByRestaurantId(
      restaurantId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getMyReviews(req.user.id, page, limit);

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    await reviewService.deleteReview(id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      data: null,
    });
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    next(error);
  }
};

module.exports = {
  createReview,
  getReviewsByRestaurant,
  getMyReviews,
  deleteReview,
};
