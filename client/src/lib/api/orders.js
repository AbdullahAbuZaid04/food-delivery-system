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

export async function getRestaurantOrders({ page = 1, limit = 20 } = {}) {
  return api.get("/orders/restaurant/my", { params: { page, limit } });
}

export async function updateOrderStatus(orderId, status) {
  return api.patch(`/orders/${orderId}/status`, { status });
}

export async function assignDriver(orderId, driverId) {
  return api.patch(`/orders/${orderId}/assign`, { driverId });
}

export async function getMyDriverOrders({ page = 1, limit = 50 } = {}) {
  return api.get("/orders/driver/my", { params: { page, limit } });
}

export async function updateDriverOrderStatus(orderId, status) {
  return api.patch(`/orders/${orderId}/driver-status`, { status });
}
