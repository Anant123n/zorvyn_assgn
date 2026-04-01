const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidators = require('../validators/userValidators');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// All user management routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ─── User CRUD ───────────────────────────────────────────
router.get('/', userController.getAllUsers);

router.get(
  '/:id',
  userValidators.paramId,
  validate,
  userController.getUserById
);

router.patch(
  '/:id',
  userValidators.updateUser,
  validate,
  userController.updateUser
);

router.patch(
  '/:id/role',
  userValidators.updateRole,
  validate,
  userController.updateUserRole
);

router.patch(
  '/:id/status',
  userValidators.paramId,
  validate,
  userController.toggleUserStatus
);

router.delete(
  '/:id',
  userValidators.paramId,
  validate,
  userController.softDeleteUser
);

module.exports = router;
