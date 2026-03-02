const clientsService = require('./clients.service');
const { emitToAll } = require('../../socket');

const list = async (req, res, next) => {
  try {
    const result = await clientsService.list(req.user, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const client = await clientsService.getById(req.params.id, req.user);
    res.json(client);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const client = await clientsService.create(req.body, req.user);
    emitToAll(req.app.get('io'), 'client:created', client);
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const client = await clientsService.update(req.params.id, req.body, req.user);
    emitToAll(req.app.get('io'), 'client:updated', client);
    res.json(client);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await clientsService.remove(req.params.id, req.user);
    emitToAll(req.app.get('io'), 'client:deleted', { id: req.params.id });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
};

const exportCsv = async (req, res, next) => {
  try {
    const csv = await clientsService.exportCsv(req.user, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove, exportCsv };
