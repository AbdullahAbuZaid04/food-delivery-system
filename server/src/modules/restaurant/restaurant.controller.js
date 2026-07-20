const restaurantService = require("./restaurant.service");

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.createRestaurant(
      req.user.id,
      req.validatedData,
    );

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully.",
      data: restaurant,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.getMyRestaurant(req.user.id);

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateRestaurant(
      req.user.id,
      req.validatedData,
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully.",
      data: restaurant,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateStatus(
      req.user.id,
      req.validatedData.status,
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant status updated successfully.",
      data: restaurant,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await restaurantService.getAllRestaurants(
      page,
      limit,
      search,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getRestaurantBySlug = async (req, res) => {
  try {
    const restaurant = await restaurantService.getRestaurantBySlug(
      req.params.slug,
    );

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  updateStatus,
  getAllRestaurants,
  getRestaurantBySlug,
};
