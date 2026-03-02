const { body, param, query, validationResult } = require('express-validator');
const { STATUSES } = require('../../common/constants/taskStatus');
const { PRIORITIES } = require('../../common/constants/priority');

const idParam = [param('id').isMongoId().withMessage('Invalid task ID')];

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').optional().trim(),
  body('clientId').isMongoId().withMessage('Valid client required'),
  body('assigneeId').optional().isMongoId(),
  body('status').optional().isIn(STATUSES),
  body('priority').optional().isIn(PRIORITIES),
  body('dueDate').optional().isISO8601(),
];

const updateValidation = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('clientId').optional().isMongoId(),
  body('assigneeId').optional().isMongoId(),
  body('status').optional().isIn(STATUSES),
  body('priority').optional().isIn(PRIORITIES),
  body('dueDate').optional().isISO8601(),
];

const statusValidation = [body('status').isIn(STATUSES).withMessage('Invalid status')];

const listValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(STATUSES),
  query('priority').optional().isIn(PRIORITIES),
  query('assigneeId').optional().isMongoId(),
  query('clientId').optional().isMongoId(),
  query('search').optional().trim(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

module.exports = { idParam, createValidation, updateValidation, statusValidation, listValidation, validate };
