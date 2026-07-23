const dashboardRepository = require("./dashboard.repository");
const restaurantRepository = require("../restaurant/restaurant.repository");

const getOwnedRestaurant = async (ownerId) => {
  const restaurant =
    await restaurantRepository.findRestaurantByOwnerId(ownerId);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

const getDashboardStats = async (ownerId) => {
  const restaurant = await getOwnedRestaurant(ownerId);
  const restaurantId = restaurant.id;

  const [ordersStats, revenueStats, reviewStats, ordersByStatus, recentOrders] =
    await Promise.all([
      dashboardRepository.getOrderStats(restaurantId),
      dashboardRepository.getRevenueStats(restaurantId),
      dashboardRepository.getReviewStats(restaurantId),
      dashboardRepository.getOrdersByStatus(restaurantId),
      dashboardRepository.getRecentOrders(restaurantId, 5),
    ]);

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      status: restaurant.status,
    },
    orders: {
      total: ordersStats.total,
      today: ordersStats.today,
      thisWeek: ordersStats.thisWeek,
      thisMonth: ordersStats.thisMonth,
    },
    revenue: {
      total: Number(revenueStats.total),
      today: Number(revenueStats.today),
      thisWeek: Number(revenueStats.thisWeek),
      thisMonth: Number(revenueStats.thisMonth),
    },
    reviews: {
      total: reviewStats.total,
      averageRating: reviewStats.averageRating
        ? Number(reviewStats.averageRating)
        : null,
    },
    ordersByStatus,
    recentOrders,
  };
};

module.exports = { getDashboardStats };
