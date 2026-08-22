import api from "./client";

export async function getRestaurants({ page = 1, limit = 50, search = "" } = {}) {
  return api.get("/restaurants", { params: { page, limit, search } });
}

export async function getRestaurantBySlug(slug) {
  return api.get(`/restaurants/${slug}`);
}

export async function getMyRestaurant() {
  return api.get("/restaurants/owner/my");
}

export async function createRestaurant(payload) {
  return api.post("/restaurants", payload);
}

export async function updateMyRestaurant(payload) {
  return api.put("/restaurants/owner/my", payload);
}

export async function updateMyRestaurantStatus(status) {
  return api.patch("/restaurants/owner/my/status", { status });
}

export async function getDrivers() {
  return api.get("/restaurants/owner/my/drivers");
}
