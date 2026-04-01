const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// ─── Public Routes ───────────────────────────────────────
router.post('/register', authValidators.register, validate, authController.register);
router.post('/login', authValidators.login, validate, authController.login);

// ─── Protected Routes ────────────────────────────────────
router.get('/me', authenticate, authController.getMe);

module.exports = router;
