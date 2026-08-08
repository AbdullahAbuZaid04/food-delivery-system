import api from "./client";

export async function getCategoriesByRestaurant(restaurantId) {
  return api.get(`/categories/restaurant/${restaurantId}`);
}
