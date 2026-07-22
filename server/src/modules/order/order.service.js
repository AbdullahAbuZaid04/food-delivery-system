const orderRepository = require("./order.repository");
const cartRepository = require("../cart/cart.repository");
const restaurantRepository = require("../restaurant/restaurant.repository");
const prisma = require("../../config/prisma");

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

  return await orderRepository.updateOrderStatus(orderId, status);
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

  return await orderRepository.assignDriver(orderId, driverId);
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  assignDriver,
};
