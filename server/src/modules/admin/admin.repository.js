const prisma = require("../../config/prisma");

const findAllUsers = async (page = 1, limit = 10, role = null) => {
  const skip = (page - 1) * limit;

  const where = role ? { role: { name: role } } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        isVerified: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      isVerified: true,
      profileImage: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
      addresses: true,
    },
  });
};

const updateUserStatus = async (id, status) => {
  return await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      role: { select: { id: true, name: true } },
    },
  });
};

const findAllRestaurants = async (page = 1, limit = 10, status = null) => {
  const skip = (page - 1) * limit;

  const where = { deletedAt: null, ...(status ? { status } : {}) };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return {
    restaurants,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const findRestaurantById = async (id) => {
  return await prisma.restaurant.findFirst({
    where: { id, deletedAt: null },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      _count: {
        select: { categories: true, meals: true, orders: true, reviews: true },
      },
    },
  });
};

const updateRestaurantStatus = async (id, status) => {
  return await prisma.restaurant.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  findAllUsers,
  findUserById,
  updateUserStatus,
  findAllRestaurants,
  findRestaurantById,
  updateRestaurantStatus,
};
