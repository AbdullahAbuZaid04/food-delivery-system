const dashboardService = require("./dashboard.service");

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.id);
    res.status(200).json({
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { getDashboardStats };
