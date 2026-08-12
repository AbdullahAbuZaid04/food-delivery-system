const adminRepository = require("./admin.repository");

const getUsers = async (page, limit, role) => {
  return await adminRepository.findAllUsers(page, limit, role);
};

const getUserById = async (id) => {
  const user = await adminRepository.findUserById(id);

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

const updateUserStatus = async (id, status) => {
  const user = await adminRepository.findUserById(id);

  if (!user) {
    throw new Error("User not found.");
  }

  return await adminRepository.updateUserStatus(id, status);
};

const getDrivers = async (page, limit, driverStatus) => {
  return await adminRepository.findAllDrivers(page, limit, driverStatus);
};

const updateDriverStatus = async (id, driverStatus) => {
  const user = await adminRepository.findUserById(id);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role.name !== "DRIVER") {
    throw new Error("User is not a driver.");
  }

  return await adminRepository.updateDriverStatus(id, driverStatus);
};

const getRestaurants = async (page, limit, status) => {
  return await adminRepository.findAllRestaurants(page, limit, status);
};

const getRestaurantById = async (id) => {
  const restaurant = await adminRepository.findRestaurantById(id);

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  return restaurant;
};

const updateRestaurantStatus = async (id, status) => {
  const restaurant = await adminRepository.findRestaurantById(id);

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  return await adminRepository.updateRestaurantStatus(id, status);
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
