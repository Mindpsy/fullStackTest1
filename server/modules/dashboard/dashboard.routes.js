const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../common/middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;
