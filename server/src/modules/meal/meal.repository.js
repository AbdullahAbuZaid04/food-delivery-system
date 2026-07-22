const prisma = require("../../config/prisma");

const createMeal = async (data) => {
  return await prisma.meal.create({
    data,
    include: {
      category: { select: { id: true, name: true } },
    },
  });
};

const findMealById = async (id) => {
  return await prisma.meal.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
    },
  });
};

const findMealsByRestaurantId = async (restaurantId, categoryId = null) => {
  const where = {
    restaurantId,
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
  };

  return await prisma.meal.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateMeal = async (id, data) => {
  return await prisma.meal.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true } },
    },
  });
};

const deleteMeal = async (id) => {
  return await prisma.meal.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const searchMeals = async (query, restaurantId = null, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    name: { contains: query, mode: "insensitive" },
    ...(restaurantId ? { restaurantId } : {}),
  };

  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true, slug: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.meal.count({ where }),
  ]);

  return {
    meals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createMeal,
  findMealById,
  findMealsByRestaurantId,
  updateMeal,
  deleteMeal,
  searchMeals,
};
