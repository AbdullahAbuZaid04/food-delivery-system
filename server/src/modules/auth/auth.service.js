const bcrypt = require("bcrypt");
const { generateToken, generateRefreshToken } = require("../../utils/jwt");

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
    },
    token,
    refreshToken,
  };
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
    isVerified: user.isVerified,
    role: user.role.name,
    addresses: user.addresses,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  register,
  login,
  getProfile,
};
