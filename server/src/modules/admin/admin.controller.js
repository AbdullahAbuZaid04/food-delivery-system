const adminService = require("./admin.service");
const { parsePagination } = require("../../utils/pagination");

const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const role = req.query.role || null;

    const result = await adminService.getUsers(page, limit, role);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedData;
    const user = await adminService.updateUserStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      data: user,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getDrivers = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const driverStatus = req.query.status || null;

    const result = await adminService.getDrivers(page, limit, driverStatus);

    res.status(200).json({
      success: true,
      message: "Drivers fetched successfully.",
      data: result.drivers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const updateDriverStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedData;
    const user = await adminService.updateDriverStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: "Driver status updated successfully.",
      data: user,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("not a driver")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getRestaurants = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const status = req.query.status || null;

    const result = await adminService.getRestaurants(page, limit, status);

    res.status(200).json({
      success: true,
      message: "Restaurants fetched successfully.",
      data: result.restaurants,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await adminService.getRestaurantById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Restaurant fetched successfully.",
      data: restaurant,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateRestaurantStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedData;
    const restaurant = await adminService.updateRestaurantStatus(
      req.params.id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Restaurant status updated successfully.",
      data: restaurant,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  getDrivers,
  updateDriverStatus,
  getRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
};
