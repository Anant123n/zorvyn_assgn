const { body, param } = require('express-validator');
const { ROLES } = require('../utils/constants');

/**
 * Validation chains for user management endpoints.
 */
const userValidators = {
  updateUser: [
    param('id').isMongoId().withMessage('Invalid user ID format'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
  ],

  updateRole: [
    param('id').isMongoId().withMessage('Invalid user ID format'),
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(Object.values(ROLES))
      .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  ],

  paramId: [
    param('id').isMongoId().withMessage('Invalid user ID format'),
  ],
};

module.exports = userValidators;
