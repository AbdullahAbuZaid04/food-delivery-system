const prisma = require("../../config/prisma");

const createRestaurant = async (data) => {
  return await prisma.restaurant.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      phone: data.phone,
      email: data.email,
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
  return await prisma.restaurant.findFirst({
    where: { slug, deletedAt: null },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      address: true,
      _count: { select: { categories: true, meals: true, reviews: true } },
    },
  });
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

  const [restaurants, total] = await Promise.all([
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
  ]);

  return {
    restaurants,
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

module.exports = {
  createRestaurant,
  findRestaurantByOwnerId,
  findRestaurantById,
  findRestaurantBySlug,
  findAllRestaurants,
  updateRestaurant,
  updateRestaurantStatus,
  updateAddress,
};
