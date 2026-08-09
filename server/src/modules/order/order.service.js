const orderRepository = require("./order.repository");
const cartRepository = require("../cart/cart.repository");
const restaurantRepository = require("../restaurant/restaurant.repository");
const eventBus = require("../../utils/eventBus");
const prisma = require("../../config/prisma");

// Publish an order event to every scope that cares (AGENTS: real-time). The
// event carries only ids + the new status — subscribers refetch the full order
// through the normal authenticated endpoints rather than trusting SSE payloads.
const emitOrderEvent = (type, order) => {
  const event = {
    type,
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    restaurantId: order.restaurantId,
    customerId: order.customerId,
    driverId: order.driverId ?? null,
    changedAt: new Date().toISOString(),
  };

  if (order.restaurantId) eventBus.publish(`restaurant:${order.restaurantId}`, event);
  if (order.customerId) eventBus.publish(`customer:${order.customerId}`, event);
  if (order.driverId) eventBus.publish(`driver:${order.driverId}`, event);
  eventBus.publish("admin", event);

  return event;
};

const generateOrderNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${random}`;
};

const getOwnedRestaurant = async (ownerId) => {
  const restaurant =
    await restaurantRepository.findRestaurantByOwnerId(ownerId);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

const createOrder = async (customerId, data) => {
  const cart = await cartRepository.findCartByCustomerId(customerId);

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const address = await prisma.address.findFirst({
    where: { id: data.addressId, userId: customerId },
  });

  if (!address) {
    throw new Error("Address not found.");
  }

  const restaurantId = cart.items[0].meal.restaurantId;

  const restaurant =
    await restaurantRepository.findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  if (restaurant.status !== "OPEN") {
    throw new Error("Restaurant is not open.");
  }

  let subtotal = 0;
  const items = cart.items.map((item) => {
    const unitPrice = Number(item.meal.price);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    return {
      mealId: item.mealId,
      mealName: item.meal.name,
      quantity: item.quantity,
      unitPrice,
      notes: item.notes,
    };
  });

  const deliveryFee = Number(restaurant.deliveryFee);
  const total = subtotal + deliveryFee;

  const order = await orderRepository.createOrder({
    orderNumber: generateOrderNumber(),
    customerId,
    restaurantId,
    addressId: data.addressId,
    phone: data.phone,
    notes: data.notes,
    paymentMethod: data.paymentMethod,
    subtotal,
    deliveryFee,
    total,
    items,
  });

  await cartRepository.clearCart(cart.id);

  emitOrderEvent("ORDER_CREATED", order);

  return order;
};

const getOrderById = async (orderId, userId, role) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  if (role === "CUSTOMER" && order.customerId !== userId) {
    throw new Error("Access denied.");
  }

  if (role === "OWNER") {
    const restaurant =
      await restaurantRepository.findRestaurantByOwnerId(userId);
    if (!restaurant || restaurant.id !== order.restaurantId) {
      throw new Error("Access denied.");
    }
  }

  if (role === "DRIVER" && order.driverId !== userId) {
    throw new Error("Access denied.");
  }

  return order;
};

const getMyOrders = async (customerId, page, limit) => {
  return await orderRepository.findOrdersByCustomerId(customerId, page, limit);
};

const getRestaurantOrders = async (ownerId, page, limit) => {
  const restaurant = await getOwnedRestaurant(ownerId);
  return await orderRepository.findOrdersByRestaurantId(
    restaurant.id,
    page,
    limit,
  );
};

const getDriverOrders = async (driverId, page, limit) => {
  return await orderRepository.findOrdersByDriverId(driverId, page, limit);
};

const updateDriverStatus = async (orderId, driverId, status) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.driverId !== driverId) {
    throw new Error("Access denied.");
  }

  // The driver only moves the delivery leg forward once the owner has
  // assigned them the order: ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED.
  const driverTransitions = {
    ASSIGNED: ["PICKED_UP"],
    PICKED_UP: ["ON_THE_WAY"],
    ON_THE_WAY: ["DELIVERED"],
  };

  const allowed = driverTransitions[order.status];
  if (!allowed || !allowed.includes(status)) {
    throw new Error(`Cannot change status from ${order.status} to ${status}.`);
  }

  const updated = await orderRepository.updateOrderStatus(orderId, status);
  emitOrderEvent("ORDER_UPDATED", updated);

  return updated;
};

const updateOrderStatus = async (orderId, ownerId, status) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const restaurant = await getOwnedRestaurant(ownerId);
  if (restaurant.id !== order.restaurantId) {
    throw new Error("Access denied.");
  }

  const validTransitions = {
    PENDING: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY"],
    READY: ["ASSIGNED"],
    ASSIGNED: ["PICKED_UP"],
    PICKED_UP: ["ON_THE_WAY"],
    ON_THE_WAY: ["DELIVERED"],
  };

  const allowed = validTransitions[order.status];
  if (!allowed || !allowed.includes(status)) {
    throw new Error(`Cannot change status from ${order.status} to ${status}.`);
  }

  const updated = await orderRepository.updateOrderStatus(orderId, status);
  emitOrderEvent("ORDER_UPDATED", updated);

  return updated;
};

const assignDriver = async (orderId, ownerId, driverId) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const restaurant = await getOwnedRestaurant(ownerId);
  if (restaurant.id !== order.restaurantId) {
    throw new Error("Access denied.");
  }

  if (order.status !== "READY") {
    throw new Error("Order must be READY to assign a driver.");
  }

  const driver = await prisma.user.findFirst({
    where: { id: driverId, deletedAt: null },
    include: { role: true },
  });

  if (!driver || driver.role.name !== "DRIVER") {
    throw new Error("Invalid driver.");
  }

  const updated = await orderRepository.assignDriver(orderId, driverId);
  emitOrderEvent("DRIVER_ASSIGNED", updated);

  return updated;
};

const cancelOrder = async (orderId, customerId) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.customerId !== customerId) {
    throw new Error("Access denied.");
  }

  if (order.status !== "PENDING" && order.status !== "ACCEPTED") {
    throw new Error(`Cannot cancel order in ${order.status} status.`);
  }

  const updated = await orderRepository.cancelOrder(orderId);
  emitOrderEvent("ORDER_CANCELLED", updated);

  return updated;
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  getDriverOrders,
  updateOrderStatus,
  updateDriverStatus,
  assignDriver,
  cancelOrder,
};
