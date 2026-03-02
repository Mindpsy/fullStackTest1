const express = require('express');
const usersController = require('./users.controller');
const usersValidation = require('./users.validation');
const authMiddleware = require('../../common/middlewares/auth.middleware');
const { requireAdmin } = require('../../common/middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/', usersValidation.listValidation, usersValidation.validate, usersController.list);
router.get('/:id', usersValidation.idParam, usersValidation.validate, usersController.getById);
router.post('/', usersValidation.createValidation, usersValidation.validate, usersController.create);
router.put('/:id', usersValidation.idParam, usersValidation.updateValidation, usersValidation.validate, usersController.update);
router.delete('/:id', usersValidation.idParam, usersValidation.validate, usersController.remove);

module.exports = router;
