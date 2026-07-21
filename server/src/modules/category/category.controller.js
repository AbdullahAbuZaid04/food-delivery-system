const categoryService = require("./category.service");

const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(
      req.user.id,
      req.validatedData
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyCategories = async (req, res) => {
  try {
    const categories = await categoryService.getMyCategories(req.user.id);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoriesByRestaurantId = async (req, res) => {
  try {
    const categories = await categoryService.getCategoriesByRestaurantId(
      req.params.restaurantId
    );

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(
      req.user.id,
      req.params.id,
      req.validatedData
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getMyCategories,
  getCategoriesByRestaurantId,
  updateCategory,
  deleteCategory,
};
