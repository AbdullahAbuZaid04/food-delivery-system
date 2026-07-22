const mealService = require("./meal.service");

const createMeal = async (req, res) => {
  try {
    const meal = await mealService.createMeal(req.user.id, req.validatedData);

    return res.status(201).json({
      success: true,
      message: "Meal created successfully.",
      data: meal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyMeals = async (req, res) => {
  try {
    const categoryId = req.query.categoryId || null;
    const meals = await mealService.getMyMeals(req.user.id, categoryId);

    return res.status(200).json({
      success: true,
      data: meals,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMealsByRestaurantId = async (req, res) => {
  try {
    const categoryId = req.query.categoryId || null;
    const meals = await mealService.getMealsByRestaurantId(
      req.params.restaurantId,
      categoryId
    );

    return res.status(200).json({
      success: true,
      data: meals,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMeal = async (req, res) => {
  try {
    const meal = await mealService.updateMeal(
      req.user.id,
      req.params.id,
      req.validatedData
    );

    return res.status(200).json({
      success: true,
      message: "Meal updated successfully.",
      data: meal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMeal = async (req, res) => {
  try {
    await mealService.deleteMeal(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Meal deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const meal = await mealService.toggleFeatured(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Meal featured status toggled.",
      data: meal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const searchMeals = async (req, res) => {
  try {
    const { q, restaurantId } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await mealService.searchMeals(q.trim(), restaurantId, page, limit);

    return res.status(200).json({
      success: true,
      data: result.meals,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
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
