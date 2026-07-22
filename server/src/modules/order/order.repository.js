const prisma = require("../../config/prisma");

const createOrder = async (data) => {
  return await prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      customerId: data.customerId,
      restaurantId: data.restaurantId,
      addressId: data.addressId,
      phone: data.phone,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      total: data.total,
      items: {
        create: data.items.map((item) => ({
          mealId: item.mealId,
          mealName: item.mealName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        })),
      },
    },
    include: {
      items: true,
      restaurant: { select: { id: true, name: true, phone: true } },
      address: true,
    },
  });
};

const findOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      driver: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      restaurant: { select: { id: true, name: true, phone: true } },
      address: true,
    },
  });
};

const findOrdersByCustomerId = async (customerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { customerId } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const findOrdersByRestaurantId = async (restaurantId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: true,
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        driver: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        address: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { restaurantId } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateOrderStatus = async (id, status) => {
  return await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: true,
      restaurant: { select: { id: true, name: true } },
    },
  });
};

const assignDriver = async (id, driverId) => {
  return await prisma.order.update({
    where: { id },
    data: {
      driverId,
      status: "ASSIGNED",
    },
    include: {
      items: true,
      driver: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      restaurant: { select: { id: true, name: true } },
    },
  });
};

module.exports = {
  createOrder,
  findOrderById,
  findOrdersByCustomerId,
  findOrdersByRestaurantId,
  updateOrderStatus,
  assignDriver,
};
