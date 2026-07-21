const prisma = require("../../config/prisma");

const createCategory = async (data) => {
  return await prisma.category.create({
    data,
    include: { _count: { select: { meals: true } } },
  });
};

const findCategoryById = async (id) => {
  return await prisma.category.findFirst({
    where: { id, deletedAt: null },
  });
};

const findCategoriesByRestaurantId = async (restaurantId) => {
  return await prisma.category.findMany({
    where: { restaurantId, deletedAt: null },
    include: { _count: { select: { meals: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data,
    include: { _count: { select: { meals: true } } },
  });
};

const deleteCategory = async (id) => {
  return await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const countMealsByCategoryId = async (categoryId) => {
  return await prisma.meal.count({
    where: { categoryId, deletedAt: null },
  });
};

module.exports = {
  createCategory,
  findCategoryById,
  findCategoriesByRestaurantId,
  updateCategory,
  deleteCategory,
  countMealsByCategoryId,
};
