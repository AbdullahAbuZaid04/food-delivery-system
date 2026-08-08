import api from "./client";

export async function getMealsByRestaurant(restaurantId, categoryId) {
  return api.get(`/meals/restaurant/${restaurantId}`, {
    params: categoryId ? { categoryId } : undefined,
  });
}
