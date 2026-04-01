const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

// ─── Summary & Analytics (Analyst + Admin) ───────────────
router.get(
  '/summary',
  authorize('analyst', 'admin'),
  dashboardController.getSummary
);

router.get(
  '/category-breakdown',
  authorize('analyst', 'admin'),
  dashboardController.getCategoryBreakdown
);

router.get(
  '/monthly-trends',
  authorize('analyst', 'admin'),
  dashboardController.getMonthlyTrends
);

// ─── Recent Activity (All authenticated users) ──────────
router.get(
  '/recent-activity',
  authorize('viewer', 'analyst', 'admin'),
  dashboardController.getRecentActivity
);

module.exports = router;
