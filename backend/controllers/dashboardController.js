const DashboardService = require('../services/dashboardService');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and summary APIs
 */

/**
 * @swagger
 * /api/v1/dashboard/summary:
 *   get:
 *     summary: Get financial summary (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Financial summary with totals
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Viewer role)
 */
exports.getSummary = async (req, res, next) => {
  try {
    const summary = await DashboardService.getSummary(req.query);

    res.status(200).json({
      status: 'success',
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/dashboard/category-breakdown:
 *   get:
 *     summary: Get category-wise financial breakdown (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Category-wise breakdown
 */
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await DashboardService.getCategoryBreakdown(req.query);

    res.status(200).json({
      status: 'success',
      results: breakdown.length,
      data: { breakdown },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/dashboard/monthly-trends:
 *   get:
 *     summary: Get monthly income/expense trends (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await DashboardService.getMonthlyTrends(req.query);

    res.status(200).json({
      status: 'success',
      results: trends.length,
      data: { trends },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/dashboard/recent-activity:
 *   get:
 *     summary: Get recent financial activity (All authenticated users)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent records to return
 *     responses:
 *       200:
 *         description: Recent activity list
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const records = await DashboardService.getRecentActivity(limit);

    res.status(200).json({
      status: 'success',
      results: records.length,
      data: { records },
    });
  } catch (error) {
    next(error);
  }
};
