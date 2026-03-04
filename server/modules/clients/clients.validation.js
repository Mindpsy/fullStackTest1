const { body, param, query, validationResult } = require('express-validator');
const { STATUSES } = require('../../common/constants/clientStatus');

const idParam = [param('id').isMongoId().withMessage('Invalid client ID')];

const createValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('status').optional().isIn(STATUSES),
  body('notes').optional().trim(),
  body('managerId').optional().isMongoId(),
];

const updateValidation = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('status').optional().isIn(STATUSES),
  body('notes').optional().trim(),
  body('managerId').optional().isMongoId(),
];

const listValidation = [
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }),
  query('status').optional({ values: 'falsy' }).isIn(STATUSES),
  query('managerId').optional({ values: 'falsy' }).isMongoId(),
  query('search').optional({ values: 'falsy' }).trim(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

module.exports = { idParam, createValidation, updateValidation, listValidation, validate };
