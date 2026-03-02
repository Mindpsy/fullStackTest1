const express = require('express');
const tasksController = require('./tasks.controller');
const tasksValidation = require('./tasks.validation');
const authMiddleware = require('../../common/middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/export', tasksValidation.listValidation, tasksValidation.validate, tasksController.exportCsv);
router.get('/', tasksValidation.listValidation, tasksValidation.validate, tasksController.list);
router.get('/:id', tasksValidation.idParam, tasksValidation.validate, tasksController.getById);
router.post('/', tasksValidation.createValidation, tasksValidation.validate, tasksController.create);
router.put('/:id', tasksValidation.idParam, tasksValidation.updateValidation, tasksValidation.validate, tasksController.update);
router.patch('/:id/status', tasksValidation.idParam, tasksValidation.statusValidation, tasksValidation.validate, tasksController.updateStatus);
router.delete('/:id', tasksValidation.idParam, tasksValidation.validate, tasksController.remove);

module.exports = router;
