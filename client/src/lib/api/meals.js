import api from "./client";

export async function getMealsByRestaurant(restaurantId, categoryId) {
  return api.get(`/meals/restaurant/${restaurantId}`, {
    params: categoryId ? { categoryId } : undefined,
  });
}

export async function getMyMeals({ categoryId } = {}) {
  return api.get("/meals/my", {
    params: categoryId ? { categoryId } : undefined,
  });
}

export async function createMeal(payload) {
  return api.post("/meals", payload);
}

export async function updateMeal(mealId, payload) {
  return api.put(`/meals/${mealId}`, payload);
}

export async function deleteMeal(mealId) {
  return api.delete(`/meals/${mealId}`);
}

export async function toggleMealFeatured(mealId) {
  return api.patch(`/meals/${mealId}/feature`);
}

export async function updateMealAvailability(mealId, status) {
  return api.patch(`/meals/${mealId}/availability`, { status });
}
