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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      driverStatus: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profileImage: true,
      status: true,
      driverStatus: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
      addresses: {
        where: { deletedAt: null },
      },
    },
  });
};

const updateUserProfile = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profileImage: true,
      status: true,
      driverStatus: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
      addresses: {
        where: { deletedAt: null },
      },
    },
  });
};

const createAddress = async (userId, data) => {
  const { isDefault, ...rest } = data;

  const activeCount = await prisma.address.count({
    where: { userId, deletedAt: null },
  });

  const makeDefault = isDefault === true || activeCount === 0;

  if (makeDefault) {
    await prisma.address.updateMany({
      where: { userId, deletedAt: null },
      data: { isDefault: false },
    });
  }

  return await prisma.address.create({
    data: {
      userId,
      ...rest,
      isDefault: makeDefault,
    },
  });
};

const findAddressById = async (id) => {
  return await prisma.address.findUnique({
    where: { id, deletedAt: null },
  });
};

const ensureSingleDefault = async (userId) => {
  const active = await prisma.address.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, isDefault: true },
    orderBy: { createdAt: "asc" },
  });

  if (active.length === 0) return;

  const defaults = active.filter((address) => address.isDefault);

  if (defaults.length === 1) return;

  if (defaults.length > 1) {
    await prisma.address.updateMany({
      where: {
        userId,
        deletedAt: null,
        id: { not: defaults[0].id },
        isDefault: true,
      },
      data: { isDefault: false },
    });
    return;
  }

  await prisma.address.update({
    where: { id: active[0].id },
    data: { isDefault: true },
  });
};

const deleteAddress = async (id, userId) => {
  const deleted = await prisma.address.update({
    where: { id },
    data: { deletedAt: new Date(), isDefault: false },
  });

  await ensureSingleDefault(userId);

  return deleted;
};

const updateAddress = async (id, userId, data) => {
  const { isDefault, ...rest } = data;

  if (isDefault === true) {
    await prisma.address.updateMany({
      where: { userId, id: { not: id }, deletedAt: null },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: {
      ...rest,
      ...(typeof isDefault === "boolean" ? { isDefault } : {}),
    },
  });

  await ensureSingleDefault(userId);

  return updated;
};

const updateDriverStatus = async (id, driverStatus) => {
  return await prisma.user.update({
    where: { id },
    data: { driverStatus },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profileImage: true,
      status: true,
      driverStatus: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
    },
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
  updateUserProfile,
  createAddress,
  findAddressById,
  deleteAddress,
  updateAddress,
  updateDriverStatus,
};
