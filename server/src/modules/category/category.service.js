const categoryRepository = require("./category.repository");
const restaurantRepository = require("../restaurant/restaurant.repository");

const getOwnedRestaurant = async (ownerId) => {
  const restaurant = await restaurantRepository.findRestaurantByOwnerId(ownerId);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

const checkCategoryOwnership = async (categoryId, ownerId) => {
  const category = await categoryRepository.findCategoryById(categoryId);
  if (!category) {
    throw new Error("Category not found.");
  }
  const restaurant = await restaurantRepository.findRestaurantById(category.restaurantId);
  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new Error("Access denied.");
  }
  return category;
};

const createCategory = async (ownerId, data) => {
  const restaurant = await getOwnedRestaurant(ownerId);

  const category = await categoryRepository.createCategory({
    restaurantId: restaurant.id,
    name: data.name,
    imageUrl: data.imageUrl,
  });

  return category;
};

const getMyCategories = async (ownerId) => {
  const restaurant = await getOwnedRestaurant(ownerId);
  return await categoryRepository.findCategoriesByRestaurantId(restaurant.id);
};

const getCategoriesByRestaurantId = async (restaurantId) => {
  return await categoryRepository.findCategoriesByRestaurantId(restaurantId);
};

const updateCategory = async (ownerId, categoryId, data) => {
  await checkCategoryOwnership(categoryId, ownerId);
  return await categoryRepository.updateCategory(categoryId, data);
};

const deleteCategory = async (ownerId, categoryId) => {
  await checkCategoryOwnership(categoryId, ownerId);

  const mealCount = await categoryRepository.countMealsByCategoryId(categoryId);
  if (mealCount > 0) {
    throw new Error("Cannot delete category with meals. Remove meals first.");
  }

  return await categoryRepository.deleteCategory(categoryId);
};

module.exports = {
  createCategory,
  getMyCategories,
  getCategoriesByRestaurantId,
  updateCategory,
  deleteCategory,
};
