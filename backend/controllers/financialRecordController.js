const FinancialRecordService = require('../services/financialRecordService');

/**
 * @swagger
 * tags:
 *   name: Financial Records
 *   description: Financial record management
 */

/**
 * @swagger
 * /api/v1/records:
 *   post:
 *     summary: Create a new financial record (Admin only)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: income
 *               category:
 *                 type: string
 *                 enum: [salary, freelance, investments, rent, utilities, food, transportation, healthcare, entertainment, education, shopping, travel, insurance, taxes, gifts, subscriptions, other]
 *                 example: salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               description:
 *                 type: string
 *                 example: "Monthly salary for January"
 *     responses:
 *       201:
 *         description: Record created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 */
exports.createRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecordService.createRecord(
      req.body,
      req.user._id
    );

    res.status(201).json({
      status: 'success',
      message: 'Financial record created successfully',
      data: { record },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/records:
 *   get:
 *     summary: Get all financial records (All authenticated users)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for range filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for range filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g. -amount, date, -createdAt)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of financial records
 *       401:
 *         description: Not authenticated
 */
exports.getRecords = async (req, res, next) => {
  try {
    const result = await FinancialRecordService.getRecords(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/records/{id}:
 *   get:
 *     summary: Get a financial record by ID (All authenticated users)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record found
 *       404:
 *         description: Record not found
 */
exports.getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecordService.getRecordById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { record },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/records/{id}:
 *   patch:
 *     summary: Update a financial record (Admin only)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
exports.updateRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecordService.updateRecord(
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      message: 'Financial record updated successfully',
      data: { record },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record (Admin only)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */
exports.deleteRecord = async (req, res, next) => {
  try {
    await FinancialRecordService.softDeleteRecord(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Financial record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
