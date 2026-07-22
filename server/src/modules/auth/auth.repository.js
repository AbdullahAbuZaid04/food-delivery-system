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

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      addresses: true,
    },
  });
};

const createAddress = async (userId, data) => {
  return await prisma.address.create({
    data: {
      userId,
      ...data,
    },
  });
};

const findAddressById = async (id) => {
  return await prisma.address.findUnique({
    where: { id },
  });
};

const deleteAddress = async (id) => {
  return await prisma.address.delete({
    where: { id },
  });
};

const updateAddress = async (id, data) => {
  return await prisma.address.update({
    where: { id },
    data,
  });
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findRoleByName,
  createUser,
  findUserWithRoleByEmail,
  updateLastLoginAt,
  findUserById,
  createAddress,
  findAddressById,
  deleteAddress,
  updateAddress,
};
