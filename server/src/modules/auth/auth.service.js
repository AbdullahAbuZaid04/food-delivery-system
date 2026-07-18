const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/jwt");

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

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role.name,
  });

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
  };
};

module.exports = {
  register,
};
