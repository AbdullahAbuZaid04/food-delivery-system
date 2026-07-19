const prisma = require("../../config/prisma");

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const findUserByPhone = async (phone) => {
  return await prisma.user.findUnique({
    where: {
      phone,
    },
  });
};

const findRoleByName = async (name) => {
  return await prisma.role.findUnique({
    where: {
      name,
    },
  });
};

const createUser = async (data) => {
  return await prisma.user.create({
    data,
    include: {
      role: true,
    },
  });
};

const findUserWithRoleByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      role: true,
    },
  });
};

const updateLastLoginAt = async (id) => {
  return await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findRoleByName,
  createUser,
  findUserWithRoleByEmail,
  updateLastLoginAt,
};
