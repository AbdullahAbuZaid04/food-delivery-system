const prisma = require("../../config/prisma");

const createReview = async (data) => {
  return await prisma.review.create({
    data,
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true },
      },
      restaurant: {
        select: { id: true, name: true },
      },
    },
  });
};

const findReviewByOrderId = async (orderId) => {
  return await prisma.review.findUnique({
    where: { orderId },
  });
};

const findReviewById = async (id) => {
  return await prisma.review.findUnique({
    where: { id },
  });
};

const findReviewsByRestaurantId = async (restaurantId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { restaurantId },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { restaurantId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const findReviewsByCustomerId = async (customerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { customerId },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { customerId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteReview = async (id) => {
  return await prisma.review.delete({
    where: { id },
  });
};

module.exports = {
  createReview,
  findReviewByOrderId,
  findReviewById,
  findReviewsByRestaurantId,
  findReviewsByCustomerId,
  deleteReview,
};
