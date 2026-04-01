const User = require('../models/User');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const { ROLES } = require('../utils/constants');

/**
 * UserService handles all user management operations.
 * Admin-only operations are enforced at the route/middleware level.
 */
class UserService {
  /**
   * Get all users with pagination, filtering, and sorting.
   * Excludes soft-deleted users.
   *
   * @param {Object} queryParams - Query string params for filtering/pagination
   * @returns {Object} { users, total, page, limit }
   */
  static async getAllUsers(queryParams) {
    const baseQuery = User.find({ isDeleted: false });

    const features = new APIFeatures(baseQuery, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [users, total] = await Promise.all([
      features.query,
      User.countDocuments({ isDeleted: false }),
    ]);

    return {
      users,
      total,
      page: features.page,
      limit: features.limit,
      totalPages: Math.ceil(total / features.limit),
    };
  }

  /**
   * Get a single user by ID.
   * @param {string} id - User ID
   * @returns {Object} User document
   * @throws {AppError} If user not found or deleted
   */
  static async getUserById(id) {
    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  /**
   * Update user fields (name, email).
   * Does not allow role or status changes through this method.
   *
   * @param {string} id - User ID
   * @param {Object} data - Fields to update
   * @returns {Object} Updated user
   * @throws {AppError} If user not found
   */
  static async updateUser(id, data) {
    // Only allow safe fields to be updated
    const allowedFields = ['name', 'email'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  /**
   * Update a user's role. Admin only.
   * Prevents admin from changing their own role.
   *
   * @param {string} id - Target user ID
   * @param {string} role - New role
   * @param {string} requestingUserId - ID of the admin making the request
   * @returns {Object} Updated user
   */
  static async updateUserRole(id, role, requestingUserId) {
    if (id === requestingUserId.toString()) {
      throw new AppError('You cannot change your own role.', 400);
    }

    if (!Object.values(ROLES).includes(role)) {
      throw new AppError(
        `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`,
        400
      );
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  /**
   * Toggle a user's status between active and inactive.
   * Prevents admin from deactivating themselves.
   *
   * @param {string} id - Target user ID
   * @param {string} requestingUserId - ID of the admin making the request
   * @returns {Object} Updated user
   */
  static async toggleUserStatus(id, requestingUserId) {
    if (id === requestingUserId.toString()) {
      throw new AppError('You cannot change your own status.', 400);
    }

    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    return user;
  }

  /**
   * Soft delete a user. Sets isDeleted to true.
   * Prevents admin from deleting themselves.
   *
   * @param {string} id - Target user ID
   * @param {string} requestingUserId - ID of the admin making the request
   * @returns {Object} Deleted user
   */
  static async softDeleteUser(id, requestingUserId) {
    if (id === requestingUserId.toString()) {
      throw new AppError('You cannot delete your own account.', 400);
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }
}

module.exports = UserService;
