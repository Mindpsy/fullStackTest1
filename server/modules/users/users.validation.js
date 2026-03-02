const { body, param, query, validationResult } = require('express-validator');
const { ROLES } = require('../../common/constants/roles');

const idParam = [param('id').isMongoId().withMessage('Invalid ID')];

const createValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(ROLES),
];

const updateValidation = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(ROLES),
  body('password').optional().isLength({ min: 6 }),
];

const listValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

module.exports = { idParam, createValidation, updateValidation, listValidation, validate };
