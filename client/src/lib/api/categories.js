import api from "./client";

export async function getCategoriesByRestaurant(restaurantId) {
  return api.get(`/categories/restaurant/${restaurantId}`);
}

export async function getMyCategories() {
  return api.get("/categories/my");
}

export async function createCategory(payload) {
  return api.post("/categories", payload);
}

export async function updateCategory(categoryId, payload) {
  return api.put(`/categories/${categoryId}`, payload);
}

export async function deleteCategory(categoryId) {
  return api.delete(`/categories/${categoryId}`);
}
