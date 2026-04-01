const { body, param, query } = require('express-validator');
const { RECORD_TYPES, RECORD_CATEGORIES } = require('../utils/constants');

/**
 * Validation chains for financial record endpoints.
 */
const financialRecordValidators = {
  createRecord: [
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isIn(Object.values(RECORD_TYPES))
      .withMessage(
        `Type must be one of: ${Object.values(RECORD_TYPES).join(', ')}`
      ),
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .isIn(RECORD_CATEGORIES)
      .withMessage(`Category must be one of: ${RECORD_CATEGORIES.join(', ')}`),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date')
      .toDate(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],

  updateRecord: [
    param('id').isMongoId().withMessage('Invalid record ID format'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('type')
      .optional()
      .isIn(Object.values(RECORD_TYPES))
      .withMessage(
        `Type must be one of: ${Object.values(RECORD_TYPES).join(', ')}`
      ),
    body('category')
      .optional()
      .isIn(RECORD_CATEGORIES)
      .withMessage(`Category must be one of: ${RECORD_CATEGORIES.join(', ')}`),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date')
      .toDate(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],

  paramId: [
    param('id').isMongoId().withMessage('Invalid record ID format'),
  ],
};

module.exports = financialRecordValidators;
