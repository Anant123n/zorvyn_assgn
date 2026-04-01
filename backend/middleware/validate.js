const { validationResult } = require('express-validator');

/**
 * Validation middleware.
 * Runs express-validator checks and returns formatted error responses.
 * Use after validation chain middleware in routes.
 *
 * Usage in routes:
 *   router.post('/', [...validationChain], validate, controller.create)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validate;
