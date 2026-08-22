const orderService = require("./order.service");
const restaurantRepository = require("../restaurant/restaurant.repository");
const { verifyToken } = require("../../utils/jwt");
const eventBus = require("../../utils/eventBus");
const prisma = require("../../config/prisma");
const { parsePagination } = require("../../utils/pagination");

// SSE stream for order events (GET /api/orders/events). Declared BEFORE the
// `authenticate` router middleware because EventSource cannot send headers —
// auth happens here via a `?token=` query param instead. The stream only
// delivers events for the caller's own scope(s); every event is a hint to
// re-fetch the order through the normal authenticated endpoints.
const streamEvents = async (req, res) => {
  let user;
  try {
    const header = req.headers.authorization || "";
    const token =
      req.query.token || header.replace(/^Bearer\s+/i, "");
    const decoded = verifyToken(token);

    user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }

  if (!user || user.status !== "ACTIVE") {
    return res.status(403).json({
      success: false,
      message: "Account is not active.",
    });
  }

  let scopes;
  if (user.role.name === "OWNER") {
    const restaurant =
      await restaurantRepository.findRestaurantByOwnerId(user.id);
    scopes = restaurant ? [`restaurant:${restaurant.id}`] : [];
  } else if (user.role.name === "DRIVER") {
    scopes = [`driver:${user.id}`];
  } else if (user.role.name === "CUSTOMER") {
    scopes = [`customer:${user.id}`];
  } else {
    scopes = ["admin"];
  }

  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  res.write(": connected\n\n");

  const unsubscribes = scopes.map((scope) =>
    eventBus.subscribe(scope, (payload) => res.write(payload)),
  );

  // Comment frames keep proxies from closing the idle connection; EventSource
  // ignores them (they never reach `onmessage`).
  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribes.forEach((off) => off());
  });
};

const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.validatedData);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);

    const result = await orderService.getMyOrders(req.user.id, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getRestaurantOrders = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);

    const result = await orderService.getRestaurantOrders(
      req.user.id,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getDriverOrders = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);

    const result = await orderService.getDriverOrders(
      req.user.id,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const order = await orderService.updateDriverStatus(
      req.params.id,
      req.user.id,
      req.validatedData.status
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated.",
      data: order,
    });
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.user.id,
      req.validatedData.status
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated.",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const assignDriver = async (req, res) => {
  try {
    const order = await orderService.assignDriver(
      req.params.id,
      req.user.id,
      req.validatedData.driverId
    );

    return res.status(200).json({
      success: true,
      message: "Driver assigned.",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  streamEvents,
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
