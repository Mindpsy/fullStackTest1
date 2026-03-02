const dashboardService = require('./dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentActivities(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getRecentActivities };
