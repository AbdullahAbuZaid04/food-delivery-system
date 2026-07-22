const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    const user = await authService.register(req.validatedData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.validatedData);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

const addAddress = async (req, res) => {
  try {
    const address = await authService.addAddress(req.user.id, req.validatedData);

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      data: address,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    await authService.deleteAddress(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const address = await authService.updateAddress(
      req.user.id,
      req.params.id,
      req.validatedData
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: address,
    });
  } catch (error) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  addAddress,
  deleteAddress,
  updateAddress,
};
