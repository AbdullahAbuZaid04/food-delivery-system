import api from "./client";

export async function getRestaurants({ page = 1, limit = 50, search = "" } = {}) {
  return api.get("/restaurants", { params: { page, limit, search } });
}

export async function getRestaurantBySlug(slug) {
  return api.get(`/restaurants/${slug}`);
}
