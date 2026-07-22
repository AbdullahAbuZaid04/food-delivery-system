const mealRepository = require("./meal.repository");
const categoryRepository = require("../category/category.repository");
const restaurantRepository = require("../restaurant/restaurant.repository");

const getOwnedRestaurant = async (ownerId) => {
  const restaurant =
    await restaurantRepository.findRestaurantByOwnerId(ownerId);
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
  const restaurant = await restaurantRepository.findRestaurantById(
    category.restaurantId,
  );
  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new Error("Access denied.");
  }
  return category;
};

const checkMealOwnership = async (mealId, ownerId) => {
  const meal = await mealRepository.findMealById(mealId);
  if (!meal) {
    throw new Error("Meal not found.");
  }
  const restaurant = await restaurantRepository.findRestaurantById(
    meal.restaurantId,
  );
  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new Error("Access denied.");
  }
  return meal;
};

const createMeal = async (ownerId, data) => {
  const restaurant = await getOwnedRestaurant(ownerId);

  await checkCategoryOwnership(data.categoryId, ownerId);

  const meal = await mealRepository.createMeal({
    restaurantId: restaurant.id,
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl,
    price: data.price,
    preparationTime: data.preparationTime,
    isFeatured: data.isFeatured,
  });

  return meal;
};

const getMyMeals = async (ownerId, categoryId) => {
  const restaurant = await getOwnedRestaurant(ownerId);
  return await mealRepository.findMealsByRestaurantId(
    restaurant.id,
    categoryId,
  );
};

const getMealsByRestaurantId = async (restaurantId, categoryId) => {
  return await mealRepository.findMealsByRestaurantId(restaurantId, categoryId);
};

const updateMeal = async (ownerId, mealId, data) => {
  await checkMealOwnership(mealId, ownerId);

  if (data.categoryId) {
    await checkCategoryOwnership(data.categoryId, ownerId);
  }

  return await mealRepository.updateMeal(mealId, data);
};

const deleteMeal = async (ownerId, mealId) => {
  await checkMealOwnership(mealId, ownerId);
  return await mealRepository.deleteMeal(mealId);
};

const toggleFeatured = async (ownerId, mealId) => {
  const meal = await checkMealOwnership(mealId, ownerId);
  return await mealRepository.updateMeal(mealId, {
    isFeatured: !meal.isFeatured,
  });
};

const searchMeals = async (query, restaurantId, page, limit) => {
  return await mealRepository.searchMeals(query, restaurantId, page, limit);
};

module.exports = {
  createMeal,
  getMyMeals,
  getMealsByRestaurantId,
  updateMeal,
  deleteMeal,
  toggleFeatured,
  searchMeals,
};
