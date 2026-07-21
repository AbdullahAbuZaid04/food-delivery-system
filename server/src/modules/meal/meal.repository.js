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

module.exports = {
  createMeal,
  findMealById,
  findMealsByRestaurantId,
  updateMeal,
  deleteMeal,
};
