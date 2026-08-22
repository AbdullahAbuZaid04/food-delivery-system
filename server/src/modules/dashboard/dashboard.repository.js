const prisma = require("../../config/prisma");

const getOrderStats = async (restaurantId) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, today, thisWeek, thisMonth] = await Promise.all([
    prisma.order.count({ where: { restaurantId } }),
    prisma.order.count({
      where: { restaurantId, createdAt: { gte: startOfToday } },
    }),
    prisma.order.count({
      where: { restaurantId, createdAt: { gte: startOfWeek } },
    }),
    prisma.order.count({
      where: { restaurantId, createdAt: { gte: startOfMonth } },
    }),
  ]);

  return { total, today, thisWeek, thisMonth };
};

const getRevenueStats = async (restaurantId) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const statuses = ["DELIVERED"];
  const baseWhere = {
    restaurantId,
    status: { in: statuses },
  };

  const [totalAgg, todayAgg, weekAgg, monthAgg] = await Promise.all([
    prisma.order.aggregate({
      where: baseWhere,
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { ...baseWhere, createdAt: { gte: startOfToday } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { ...baseWhere, createdAt: { gte: startOfWeek } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { ...baseWhere, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
  ]);

  return {
    total: totalAgg._sum.total || 0,
    today: todayAgg._sum.total || 0,
    thisWeek: weekAgg._sum.total || 0,
    thisMonth: monthAgg._sum.total || 0,
  };
};

const getReviewStats = async (restaurantId) => {
  const [total, avg] = await Promise.all([
    prisma.review.count({ where: { restaurantId } }),
    prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
    }),
  ]);

  return {
    total,
    averageRating: avg._avg.rating,
  };
};

const getOrdersByStatus = async (restaurantId) => {
  const counts = await prisma.order.groupBy({
    by: ["status"],
    where: { restaurantId },
    _count: { id: true },
  });

  const result = {};
  counts.forEach((c) => {
    result[c.status] = c._count.id;
  });

  return result;
};

const getRecentOrders = async (restaurantId, limit = 5) => {
  return await prisma.order.findMany({
    where: { restaurantId },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true },
      },
      items: {
        select: { mealName: true, quantity: true, unitPrice: true },
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  getOrderStats,
  getRevenueStats,
  getReviewStats,
  getOrdersByStatus,
  getRecentOrders,
};
