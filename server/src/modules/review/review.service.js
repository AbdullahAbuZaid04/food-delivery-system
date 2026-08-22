const reviewRepository = require("./review.repository");
const orderRepository = require("../order/order.repository");

const createReview = async (customerId, orderId, rating, comment) => {
  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.customerId !== customerId) {
    throw new Error("Access denied.");
  }

  if (order.status !== "DELIVERED") {
    throw new Error("You can only review delivered orders.");
  }

  const existing = await reviewRepository.findReviewByOrderId(orderId);

  if (existing) {
    throw new Error("You have already reviewed this order.");
  }

  return await reviewRepository.createReview({
    orderId,
    customerId,
    restaurantId: order.restaurantId,
    rating,
    comment,
  });
};

const getReviewsByRestaurantId = async (restaurantId, page, limit) => {
  return await reviewRepository.findReviewsByRestaurantId(
    restaurantId,
    page,
    limit
  );
};

const getMyReviews = async (customerId, page, limit) => {
  return await reviewRepository.findReviewsByCustomerId(customerId, page, limit);
};

const deleteReview = async (reviewId, customerId) => {
  const review = await reviewRepository.findReviewById(reviewId);

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.customerId !== customerId) {
    throw new Error("Access denied.");
  }

  return await reviewRepository.deleteReview(review.id);
};

module.exports = {
  createReview,
  getReviewsByRestaurantId,
  getMyReviews,
  deleteReview,
};
