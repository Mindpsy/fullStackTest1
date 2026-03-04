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
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 500 }),
  query('status').optional({ values: 'falsy' }).isIn(STATUSES),
  query('priority').optional({ values: 'falsy' }).isIn(PRIORITIES),
  query('assigneeId').optional({ values: 'falsy' }).isMongoId(),
  query('clientId').optional({ values: 'falsy' }).isMongoId(),
  query('search').optional({ values: 'falsy' }).trim(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

module.exports = { idParam, createValidation, updateValidation, statusValidation, listValidation, validate };
