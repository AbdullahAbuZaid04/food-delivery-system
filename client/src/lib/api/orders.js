import api from "./client";

export async function createOrder(payload) {
  return api.post("/orders", payload);
}

export async function getMyOrders({ page = 1, limit = 50 } = {}) {
  return api.get("/orders/my", { params: { page, limit } });
}

export async function getOrderById(orderId) {
  return api.get(`/orders/${orderId}`);
}

export async function cancelOrder(orderId) {
  return api.patch(`/orders/${orderId}/cancel`);
}
