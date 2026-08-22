const cartRepository = require("./cart.repository");
const prisma = require("../../config/prisma");

const getOrCreateCart = async (customerId) => {
  let cart = await cartRepository.findCartByCustomerId(customerId);
  if (!cart) {
    cart = await cartRepository.createCart(customerId);
  }
  return cart;
};

const validateMeal = async (mealId) => {
  const meal = await prisma.meal.findFirst({
    where: { id: mealId, deletedAt: null },
    select: {
      id: true,
      name: true,
      price: true,
      restaurantId: true,
      status: true,
    },
  });

  if (!meal) {
    throw new Error("Meal not found.");
  }

  if (meal.status !== "AVAILABLE") {
    throw new Error("Meal is not available.");
  }

  return meal;
};

const checkSameRestaurant = async (cart, newRestaurantId) => {
  if (cart.items.length === 0) return;

  const existingRestaurantId = cart.items[0].meal.restaurantId;

  if (existingRestaurantId !== newRestaurantId) {
    throw new Error(
      "Cannot add meals from different restaurants. Clear your cart first.",
    );
  }
};

const addItem = async (customerId, data) => {
  const cart = await getOrCreateCart(customerId);

  const meal = await validateMeal(data.mealId);

  await checkSameRestaurant(cart, meal.restaurantId);

  const existingItem = await cartRepository.findCartItem(cart.id, data.mealId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + (data.quantity || 1);
    return await cartRepository.updateCartItem(cart.id, data.mealId, {
      quantity: newQuantity,
      notes: data.notes || existingItem.notes,
    });
  }

  return await cartRepository.createCartItem({
    cartId: cart.id,
    mealId: data.mealId,
    quantity: data.quantity || 1,
    notes: data.notes,
  });
};

const getCart = async (customerId) => {
  const cart = await getOrCreateCart(customerId);

  let subtotal = 0;
  const items = cart.items.map((item) => {
    const itemTotal = Number(item.meal.price) * item.quantity;
    subtotal += itemTotal;
    return {
      ...item,
      itemTotal,
    };
  });

  return {
    id: cart.id,
    items,
    itemCount: items.length,
    subtotal,
  };
};

const updateItem = async (customerId, mealId, quantity) => {
  const cart = await getOrCreateCart(customerId);

  const existingItem = await cartRepository.findCartItem(cart.id, mealId);
  if (!existingItem) {
    throw new Error("Item not found in cart.");
  }

  if (quantity === 0) {
    await cartRepository.deleteCartItem(cart.id, mealId);
    return null;
  }

  return await cartRepository.updateCartItem(cart.id, mealId, { quantity });
};

const removeItem = async (customerId, mealId) => {
  const cart = await getOrCreateCart(customerId);

  const existingItem = await cartRepository.findCartItem(cart.id, mealId);
  if (!existingItem) {
    throw new Error("Item not found in cart.");
  }

  await cartRepository.deleteCartItem(cart.id, mealId);
};

const clearCart = async (customerId) => {
  const cart = await getOrCreateCart(customerId);
  await cartRepository.clearCart(cart.id);
};

module.exports = {
  addItem,
  getCart,
  updateItem,
  removeItem,
  clearCart,
};
