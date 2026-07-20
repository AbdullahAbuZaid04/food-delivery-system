const restaurantRepository = require("./restaurant.repository");

// ========================
// HELPERS
// ========================

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const checkOwnerHasRestaurant = async (ownerId) => {
  const existing = await restaurantRepository.findRestaurantByOwnerId(ownerId);
  if (existing) {
    throw new Error("You already have a restaurant.");
  }
  return existing;
};

const getOwnedRestaurant = async (ownerId) => {
  const restaurant =
    await restaurantRepository.findRestaurantByOwnerId(ownerId);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

// ========================
// RESTAURANT
// ========================

const createRestaurant = async (ownerId, data) => {
  await checkOwnerHasRestaurant(ownerId);

  let slug = generateSlug(data.name);
  const existingSlug = await restaurantRepository.findRestaurantBySlug(slug);
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const restaurant = await restaurantRepository.createRestaurant({
    ...data,
    slug,
    ownerId,
  });

  return restaurant;
};

const getMyRestaurant = async (ownerId) => {
  return await getOwnedRestaurant(ownerId);
};

const updateRestaurant = async (ownerId, data) => {
  const restaurant = await getOwnedRestaurant(ownerId);

  const updateData = { ...data };

  if (data.name) {
    let slug = generateSlug(data.name);
    const existingSlug = await restaurantRepository.findRestaurantBySlug(slug);
    if (existingSlug && existingSlug.id !== restaurant.id) {
      slug = `${slug}-${Date.now()}`;
    }
    updateData.slug = slug;
  }

  if (data.address) {
    await restaurantRepository.updateAddress(
      restaurant.addressId,
      data.address,
    );
    delete updateData.address;
  }

  const updated = await restaurantRepository.updateRestaurant(
    ownerId,
    updateData,
  );
  return updated;
};

const updateStatus = async (ownerId, status) => {
  await getOwnedRestaurant(ownerId);
  return await restaurantRepository.updateRestaurantStatus(ownerId, status);
};

const getAllRestaurants = async (page, limit, search) => {
  return await restaurantRepository.findAllRestaurants(page, limit, search);
};

const getRestaurantBySlug = async (slug) => {
  const restaurant = await restaurantRepository.findRestaurantBySlug(slug);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  updateStatus,
  getAllRestaurants,
  getRestaurantBySlug,
};
