import api from "./client";

export async function getCart() {
  return api.get("/cart");
}

export async function addToCart(mealId, quantity = 1, notes) {
  return api.post("/cart/items", { mealId, quantity, notes });
}

export async function updateCartItem(mealId, quantity) {
  return api.put(`/cart/items/${mealId}`, { quantity });
}

export async function removeFromCart(mealId) {
  return api.delete(`/cart/items/${mealId}`);
}

export async function clearCart() {
  return api.delete("/cart");
}
