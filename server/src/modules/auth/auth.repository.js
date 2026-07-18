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

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findRoleByName,
  createUser,
};
