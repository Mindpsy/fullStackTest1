const express = require('express');
const clientsController = require('./clients.controller');
const clientsValidation = require('./clients.validation');
const authMiddleware = require('../../common/middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/export', clientsValidation.listValidation, clientsValidation.validate, clientsController.exportCsv);
router.get('/', clientsValidation.listValidation, clientsValidation.validate, clientsController.list);
router.get('/:id', clientsValidation.idParam, clientsValidation.validate, clientsController.getById);
router.post('/', clientsValidation.createValidation, clientsValidation.validate, clientsController.create);
router.put('/:id', clientsValidation.idParam, clientsValidation.updateValidation, clientsValidation.validate, clientsController.update);
router.delete('/:id', clientsValidation.idParam, clientsValidation.validate, clientsController.remove);

module.exports = router;
