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

module.exports = {
  register,
};
