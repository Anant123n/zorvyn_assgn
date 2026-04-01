const FinancialRecord = require('../models/FinancialRecord');

/**
 * DashboardService provides aggregated financial analytics using MongoDB
 * aggregation pipelines for efficient server-side computation.
 */
class DashboardService {
  /**
   * Build date filter for aggregation pipelines.
   * @param {Object} filters - { startDate, endDate }
   * @returns {Object} MongoDB match filter for date
   */
  static _buildDateFilter(filters = {}) {
    const dateFilter = {};
    if (filters.startDate) {
      dateFilter.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      dateFilter.$lte = new Date(filters.endDate);
    }
    return Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
  }

  /**
   * Get financial summary: total income, total expenses, net balance, record count.
   *
   * @param {Object} filters - { startDate, endDate }
   * @returns {Object} { totalIncome, totalExpenses, netBalance, totalRecords }
   */
  static async getSummary(filters = {}) {
    const dateFilter = DashboardService._buildDateFilter(filters);

    const matchStage = { isDeleted: false, ...dateFilter };

    const result = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpenses: { $round: ['$totalExpenses', 2] },
          netBalance: {
            $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2],
          },
          totalRecords: 1,
        },
      },
    ]);

    // Return default values if no records exist
    return (
      result[0] || {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        totalRecords: 0,
      }
    );
  }

  /**
   * Get category-wise breakdown of income and expenses.
   *
   * @param {Object} filters - { startDate, endDate }
   * @returns {Array} [{ category, totalIncome, totalExpenses, netAmount, count }]
   */
  static async getCategoryBreakdown(filters = {}) {
    const dateFilter = DashboardService._buildDateFilter(filters);

    const matchStage = { isDeleted: false, ...dateFilter };

    const result = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpenses: { $round: ['$totalExpenses', 2] },
          netAmount: {
            $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2],
          },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return result;
  }

  /**
   * Get monthly income/expense trends.
   * Groups data by year-month for charting.
   *
   * @param {Object} filters - { startDate, endDate }
   * @returns {Array} [{ year, month, label, totalIncome, totalExpenses, netAmount, count }]
   */
  static async getMonthlyTrends(filters = {}) {
    const dateFilter = DashboardService._buildDateFilter(filters);

    const matchStage = { isDeleted: false, ...dateFilter };

    const result = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          label: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpenses: { $round: ['$totalExpenses', 2] },
          netAmount: {
            $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2],
          },
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    return result;
  }

  /**
   * Get recent activity (latest N financial records).
   *
   * @param {number} limit - Number of records to return (default: 10)
   * @returns {Array} Recent financial records with creator info
   */
  static async getRecentActivity(limit = 10) {
    const records = await FinancialRecord.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'name email role')
      .select('-__v');

    return records;
  }
}

module.exports = DashboardService;
