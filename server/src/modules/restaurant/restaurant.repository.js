const prisma = require("../../config/prisma");

const createRestaurant = async (data) => {
  return await prisma.restaurant.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      phone: data.phone,
      email: data.email,
      cuisine: data.cuisine,
      logoUrl: data.logoUrl,
      coverImageUrl: data.coverImageUrl,
      deliveryFee: data.deliveryFee,
      minimumOrder: data.minimumOrder,
      estimatedDeliveryTime: data.estimatedDeliveryTime,
      owner: { connect: { id: data.ownerId } },
      address: {
        create: {
          userId: data.ownerId,
          label: data.address.label,
          city: data.address.city,
          street: data.address.street,
          building: data.address.building,
          details: data.address.details,
          latitude: data.address.latitude,
          longitude: data.address.longitude,
        },
      },
    },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      address: true,
    },
  });
};

const findRestaurantByOwnerId = async (ownerId) => {
  return await prisma.restaurant.findFirst({
    where: { ownerId, deletedAt: null },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      address: true,
      _count: { select: { categories: true, meals: true } },
    },
  });
};

const findRestaurantById = async (id) => {
  return await prisma.restaurant.findFirst({
    where: { id, deletedAt: null },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      address: true,
    },
  });
};

const findRestaurantBySlug = async (slug) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, deletedAt: null },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      address: true,
      _count: { select: { categories: true, meals: true, reviews: true } },
    },
  });
  if (!restaurant) return null;

  // Same rating merge as findAllRestaurants — the detail screen (restaurant
  // header) needs the real average rating, not "جديد" whenever reviews exist.
  const ratingRows = await prisma.review.groupBy({
    by: ["restaurantId"],
    where: { restaurantId: restaurant.id },
    _avg: { rating: true },
  });

  return {
    ...restaurant,
    rating: ratingRows[0]?._avg.rating ?? null,
  };
};

const findAllRestaurants = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    status: "OPEN",
    ...(search
      ? {
          name: { contains: search, mode: "insensitive" },
        }
      : {}),
  };

  const [restaurants, total, allIds] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: {
        address: { select: { city: true, street: true } },
        _count: { select: { meals: true, reviews: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({ where, select: { id: true } }),
  ]);

  const ratingRows = await prisma.review.groupBy({
    by: ["restaurantId"],
    where: { restaurantId: { in: allIds.map((item) => item.id) } },
    _avg: { rating: true },
  });

  // Merge each restaurant's average review rating onto its row so the customer
  // app can show ratings on the cards without an extra N+1 query per restaurant.
  const ratingById = new Map(
    ratingRows.map((row) => [row.restaurantId, row._avg.rating]),
  );

  // A few meal names per restaurant (up to 3) for the card "الأطباق" chips —
  // one query for all listed restaurants, no N+1.
  const mealRows = await prisma.meal.findMany({
    where: {
      restaurantId: { in: allIds.map((item) => item.id) },
      deletedAt: null,
      status: "AVAILABLE",
    },
    select: { restaurantId: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const dishesById = new Map();
  for (const row of mealRows) {
    const list = dishesById.get(row.restaurantId) ?? [];
    if (list.length < 3) {
      list.push(row.name);
      dishesById.set(row.restaurantId, list);
    }
  }

  return {
    restaurants: restaurants.map((restaurant) => ({
      ...restaurant,
      rating: ratingById.get(restaurant.id) ?? null,
      dishes: dishesById.get(restaurant.id) ?? [],
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateRestaurant = async (ownerId, data) => {
  return await prisma.restaurant.update({
    where: { ownerId },
    data,
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      address: true,
    },
  });
};

const updateRestaurantStatus = async (ownerId, status) => {
  return await prisma.restaurant.update({
    where: { ownerId },
    data: { status },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
};

const updateAddress = async (addressId, data) => {
  return await prisma.address.update({
    where: { id: addressId },
    data,
  });
};

const findActiveDrivers = async () => {
  return await prisma.user.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      driverStatus: "APPROVED",
      role: { name: "DRIVER" },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: { firstName: "asc" },
  });
};

module.exports = {
  createRestaurant,
  findRestaurantByOwnerId,
  findRestaurantById,
  findRestaurantBySlug,
  findAllRestaurants,
  updateRestaurant,
  updateRestaurantStatus,
  updateAddress,
  findActiveDrivers,
};
