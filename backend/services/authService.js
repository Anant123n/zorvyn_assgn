const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * AuthService handles user registration, login, and JWT generation.
 */
class AuthService {
  /**
   * Generate a JWT for a given user ID.
   * @param {string} userId
   * @returns {string} Signed JWT
   */
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Register a new user.
   * @param {Object} userData - { name, email, password, role? }
   * @returns {Object} { user, token }
   * @throws {AppError} If email already exists
   */
  static async register(userData) {
    // Check for existing user
    const existingUser = await User.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 409);
    }

    // Create user (password is hashed via pre-save hook)
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'viewer',
    });

    const token = AuthService.generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    return { user, token };
  }

  /**
   * Authenticate a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Object} { user, token }
   * @throws {AppError} If credentials invalid or account inactive/deleted
   */
  static async login(email, password) {
    // Find user with password field included
    const user = await User.findOne({ email, isDeleted: false }).select(
      '+password'
    );

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Check account status
    if (user.status === 'inactive') {
      throw new AppError(
        'Your account has been deactivated. Contact an admin.',
        403
      );
    }

    const token = AuthService.generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    return { user, token };
  }
}

module.exports = AuthService;
