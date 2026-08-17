const bcrypt = require("bcrypt");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshExpiresMs,
} = require("../../utils/jwt");
const { blacklistToken, isBlacklisted } = require("../../utils/tokenBlacklist");

const authRepository = require("./auth.repository");

const register = async (userData) => {
  const { firstName, lastName, email, phone, password, role } = userData;

  // Check email
  const emailExists = await authRepository.findUserByEmail(email);

  if (emailExists) {
    throw new Error("Email already exists.");
  }

  // Check phone
  const phoneExists = await authRepository.findUserByPhone(phone);

  if (phoneExists) {
    throw new Error("Phone number already exists.");
  }

  // Get role
  const userRole = await authRepository.findRoleByName(role);

  if (!userRole) {
    throw new Error("Role not found.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    roleId: userRole.id,
  });

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role.name,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      driverStatus: user.driverStatus ?? null,
    },
    token,
    refreshToken,
  };
};

const login = async (loginData) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await authRepository.findUserWithRoleByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  // Update lastLoginAt
  await authRepository.updateLastLoginAt(user.id);

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    role: user.role.name,
    email: user.email,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      driverStatus: user.driverStatus ?? null,
    },
    token,
    refreshToken,
  };
};

const refresh = async (refreshToken) => {
  if (isBlacklisted(refreshToken)) {
    throw new Error("Refresh token has been revoked.");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error("Invalid refresh token.");
  }

  const user = await authRepository.findUserById(decoded.id);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Account is not active.");
  }

  blacklistToken(refreshToken, Date.now() + getRefreshExpiresMs());

  const tokenPayload = {
    id: user.id,
    role: user.role.name,
    email: user.email,
  };

  const token = generateToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      driverStatus: user.driverStatus ?? null,
    },
    token,
    refreshToken: newRefreshToken,
  };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      blacklistToken(refreshToken, Date.now() + getRefreshExpiresMs());
    } catch {
      // Token already invalid — nothing to blacklist
    }
  }
};

const getProfile = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    status: user.status,
    driverStatus: user.driverStatus ?? null,
    isVerified: user.isVerified,
    role: user.role.name,
    addresses: user.addresses,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const updateProfile = async (userId, data) => {
  const updateData = {};

  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;

  if (data.phone !== undefined) {
    const existing = await authRepository.findUserByPhone(data.phone);
    if (existing && existing.id !== userId) {
      throw new Error("Phone number already exists.");
    }
    updateData.phone = data.phone;
  }

  const user = await authRepository.updateUserProfile(userId, updateData);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    status: user.status,
    driverStatus: user.driverStatus ?? null,
    isVerified: user.isVerified,
    role: user.role.name,
    addresses: user.addresses,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// A rejected driver can re-submit their application back into the admin review
// queue (mirrors the restaurant REJECTED → PENDING flow). PENDING/APPROVED
// applications are left untouched.
const reapplyAsDriver = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role.name !== "DRIVER") {
    throw new Error("Only drivers can re-apply.");
  }

  if (user.driverStatus !== "REJECTED") {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      status: user.status,
      driverStatus: user.driverStatus,
      isVerified: user.isVerified,
      role: user.role.name,
      addresses: user.addresses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  const updated = await authRepository.updateDriverStatus(userId, "PENDING");

  return {
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    phone: updated.phone,
    profileImage: updated.profileImage,
    status: updated.status,
    driverStatus: updated.driverStatus,
    isVerified: updated.isVerified,
    role: updated.role.name,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

const addAddress = async (userId, addressData) => {
  try {
    return await authRepository.createAddress(userId, addressData);
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error("Only one default address is allowed.");
    }
    throw error;
  }
};

const deleteAddress = async (userId, addressId) => {
  const address = await authRepository.findAddressById(addressId);

  if (!address) {
    throw new Error("Address not found.");
  }

  if (address.userId !== userId) {
    throw new Error("Access denied.");
  }

  return await authRepository.deleteAddress(addressId, userId);
};

const updateAddress = async (userId, addressId, addressData) => {
  const address = await authRepository.findAddressById(addressId);

  if (!address) {
    throw new Error("Address not found.");
  }

  if (address.userId !== userId) {
    throw new Error("Access denied.");
  }

  try {
    return await authRepository.updateAddress(addressId, userId, addressData);
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error("Only one default address is allowed.");
    }
    throw error;
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  addAddress,
  deleteAddress,
  updateAddress,
  updateProfile,
  reapplyAsDriver,
};
