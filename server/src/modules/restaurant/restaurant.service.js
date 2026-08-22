const restaurantRepository = require("./restaurant.repository");

// ========================
// HELPERS
// ========================

// ASCII-only slug generator. Arabic restaurant names strip down to nothing
// (the regex keeps only a-z/0-9/whitespace), so we fall back to a timestamped
// slug instead of returning an empty string (which would break the @unique
// slug on the DB and the public /restaurants/:slug route).
const generateSlug = (name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `restaurant-${Date.now()}`;
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

// The owner can only toggle an active restaurant (OPEN ↔ CLOSED) or, from a
// rejection, re-request review (REJECTED → PENDING). Pending/suspended
// restaurants can't be flipped to OPEN by the owner — approval is admin-only.
const updateStatus = async (ownerId, status) => {
  const restaurant = await getOwnedRestaurant(ownerId);

  if (status === "OPEN" || status === "CLOSED") {
    if (restaurant.status !== "OPEN" && restaurant.status !== "CLOSED") {
      throw new Error(
        "Restaurant status can only be toggled when the restaurant is active.",
      );
    }
  } else if (status === "PENDING") {
    if (restaurant.status !== "REJECTED") {
      throw new Error("Restaurant can only be re-submitted after a rejection.");
    }
  } else {
    throw new Error("Invalid status.");
  }

  return await restaurantRepository.updateRestaurantStatus(ownerId, status);
};

const getAllRestaurants = async (page, limit, search) => {
  return await restaurantRepository.findAllRestaurants(page, limit, search);
};

// Public slug lookup must only surface approved, live restaurants — a
// PENDING/REJECTED/SUSPENDED restaurant is invisible on the storefront. The
// guard lives here (not the repository) because the same repository function
// also serves the slug-uniqueness check during create/update.
const getRestaurantBySlug = async (slug) => {
  const restaurant = await restaurantRepository.findRestaurantBySlug(slug);
  if (!restaurant || restaurant.status !== "OPEN") {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

const getDrivers = async () => {
  return await restaurantRepository.findActiveDrivers();
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  updateStatus,
  getAllRestaurants,
  getRestaurantBySlug,
  getDrivers,
};
