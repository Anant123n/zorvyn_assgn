const FinancialRecord = require('../models/FinancialRecord');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * FinancialRecordService handles CRUD operations for financial records.
 */
class FinancialRecordService {
  /**
   * Create a new financial record.
   *
   * @param {Object} data - Record data { amount, type, category, date, description }
   * @param {string} userId - ID of the creating user
   * @returns {Object} Created record
   */
  static async createRecord(data, userId) {
    const record = await FinancialRecord.create({
      ...data,
      createdBy: userId,
    });

    return record;
  }

  /**
   * Get all financial records with filtering, sorting, pagination, and search.
   * Supports query parameters:
   *   - type: 'income' | 'expense'
   *   - category: category name
   *   - startDate / endDate: date range filtering
   *   - search: text search on description
   *   - sort: field to sort by (e.g., '-amount', 'date')
   *   - page / limit: pagination
   *
   * @param {Object} queryParams - Query string parameters
   * @returns {Object} { records, total, page, limit, totalPages }
   */
  static async getRecords(queryParams) {
    // Build base filter
    const filter = { isDeleted: false };

    // Type filter
    if (queryParams.type) {
      filter.type = queryParams.type;
    }

    // Category filter
    if (queryParams.category) {
      filter.category = queryParams.category;
    }

    // Date range filter
    if (queryParams.startDate || queryParams.endDate) {
      filter.date = {};
      if (queryParams.startDate) {
        filter.date.$gte = new Date(queryParams.startDate);
      }
      if (queryParams.endDate) {
        filter.date.$lte = new Date(queryParams.endDate);
      }
    }

    // Text search on description
    if (queryParams.search) {
      filter.description = { $regex: queryParams.search, $options: 'i' };
    }

    // Remove custom filters from queryParams so APIFeatures doesn't double-apply them
    const cleanParams = { ...queryParams };
    delete cleanParams.startDate;
    delete cleanParams.endDate;
    delete cleanParams.search;
    delete cleanParams.type;
    delete cleanParams.category;

    const baseQuery = FinancialRecord.find(filter).populate(
      'createdBy',
      'name email role'
    );

    const features = new APIFeatures(baseQuery, cleanParams)
      .sort()
      .limitFields()
      .paginate();

    // Count total matching documents for pagination metadata
    const [records, total] = await Promise.all([
      features.query,
      FinancialRecord.countDocuments(filter),
    ]);

    return {
      records,
      total,
      page: features.page,
      limit: features.limit,
      totalPages: Math.ceil(total / features.limit),
    };
  }

  /**
   * Get a single financial record by ID.
   *
   * @param {string} id - Record ID
   * @returns {Object} Financial record
   * @throws {AppError} If not found or deleted
   */
  static async getRecordById(id) {
    const record = await FinancialRecord.findOne({
      _id: id,
      isDeleted: false,
    }).populate('createdBy', 'name email role');

    if (!record) {
      throw new AppError('Financial record not found.', 404);
    }

    return record;
  }

  /**
   * Update a financial record.
   *
   * @param {string} id - Record ID
   * @param {Object} data - Fields to update
   * @returns {Object} Updated record
   * @throws {AppError} If not found
   */
  static async updateRecord(id, data) {
    // Only allow safe fields to be updated
    const allowedFields = ['amount', 'type', 'category', 'date', 'description'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const record = await FinancialRecord.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!record) {
      throw new AppError('Financial record not found.', 404);
    }

    return record;
  }

  /**
   * Soft delete a financial record.
   *
   * @param {string} id - Record ID
   * @returns {Object} Deleted record
   * @throws {AppError} If not found
   */
  static async softDeleteRecord(id) {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!record) {
      throw new AppError('Financial record not found.', 404);
    }

    return record;
  }
}

module.exports = FinancialRecordService;
