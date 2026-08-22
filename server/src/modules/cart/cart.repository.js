const prisma = require("../../config/prisma");

const findCartByCustomerId = async (customerId) => {
  return await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          meal: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              restaurantId: true,
              status: true,
            },
          },
        },
        orderBy: { id: "desc" },
      },
    },
  });
};

const createCart = async (customerId) => {
  return await prisma.cart.create({
    data: { customerId },
    include: { items: true },
  });
};

const findCartItem = async (cartId, mealId) => {
  return await prisma.cartItem.findUnique({
    where: { cartId_mealId: { cartId, mealId } },
  });
};

const createCartItem = async (data) => {
  return await prisma.cartItem.create({
    data,
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          restaurantId: true,
        },
      },
    },
  });
};

const updateCartItem = async (cartId, mealId, data) => {
  return await prisma.cartItem.update({
    where: { cartId_mealId: { cartId, mealId } },
    data,
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          restaurantId: true,
        },
      },
    },
  });
};

const deleteCartItem = async (cartId, mealId) => {
  return await prisma.cartItem.delete({
    where: { cartId_mealId: { cartId, mealId } },
  });
};

const clearCart = async (cartId) => {
  return await prisma.cartItem.deleteMany({
    where: { cartId },
  });
};

module.exports = {
  findCartByCustomerId,
  createCart,
  findCartItem,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
