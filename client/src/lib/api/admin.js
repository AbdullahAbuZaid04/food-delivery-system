import api from "./client";

// Admin-only API calls (server mounts them behind authorize("ADMIN")). The
// list endpoints return the users/restaurants array via the shared envelope
// unwrap; pagination arrives as a sibling the interceptor drops, so the admin
// pages fetch with a high limit and filter/paginate client-side (same pattern
// as the reviews endpoint, AGENTS.md §11).

export async function getUsers({ page = 1, limit = 100, role } = {}) {
  return api.get("/admin/users", { params: { page, limit, role } });
}

export async function getUserById(userId) {
  return api.get(`/admin/users/${userId}`);
}

export async function updateUserStatus(userId, status) {
  return api.patch(`/admin/users/${userId}/status`, { status });
}

export async function updateDriverStatus(driverId, status) {
  return api.patch(`/admin/drivers/${driverId}/status`, { status });
}

export async function getRestaurants({ page = 1, limit = 100, status } = {}) {
  return api.get("/admin/restaurants", { params: { page, limit, status } });
}

export async function getRestaurantById(restaurantId) {
  return api.get(`/admin/restaurants/${restaurantId}`);
}

export async function updateRestaurantStatus(restaurantId, status) {
  return api.patch(`/admin/restaurants/${restaurantId}/status`, { status });
}
