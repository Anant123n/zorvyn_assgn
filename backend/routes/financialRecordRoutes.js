const express = require('express');
const router = express.Router();
const financialRecordController = require('../controllers/financialRecordController');
const financialRecordValidators = require('../validators/financialRecordValidators');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// All financial record routes require authentication
router.use(authenticate);

// ─── Read Operations (Viewer, Analyst, Admin) ────────────
router.get(
  '/',
  authorize('viewer', 'analyst', 'admin'),
  financialRecordController.getRecords
);

router.get(
  '/:id',
  authorize('viewer', 'analyst', 'admin'),
  financialRecordValidators.paramId,
  validate,
  financialRecordController.getRecordById
);

// ─── Write Operations (Admin only) ──────────────────────
router.post(
  '/',
  authorize('admin'),
  financialRecordValidators.createRecord,
  validate,
  financialRecordController.createRecord
);

router.patch(
  '/:id',
  authorize('admin'),
  financialRecordValidators.updateRecord,
  validate,
  financialRecordController.updateRecord
);

router.delete(
  '/:id',
  authorize('admin'),
  financialRecordValidators.paramId,
  validate,
  financialRecordController.deleteRecord
);

module.exports = router;
