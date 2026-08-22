import api from "./client";

// Owner reads its own restaurant's reviews through the public reviews route
// (there is no OWNER-scoped reviews endpoint yet — this one is public and
// returns the same shape, so it works for the dashboard).
export async function getRestaurantReviews(
  restaurantId,
  { page = 1, limit = 20 } = {},
) {
  return api.get(`/reviews/restaurant/${restaurantId}`, {
    params: { page, limit },
  });
}

// Customer rates a delivered order (1–5 stars + optional comment). The server
// enforces: order must belong to the caller, must be DELIVERED, one review
// per order.
export async function createReview(orderId, { rating, comment } = {}) {
  return api.post("/reviews", { orderId, rating, comment });
}
