const tasksService = require('./tasks.service');
const { emitToAll } = require('../../socket');

const list = async (req, res, next) => {
  try {
    const result = await tasksService.list(req.user, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await tasksService.getById(req.params.id, req.user);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const task = await tasksService.create(req.body, req.user);
    emitToAll(req.app.get('io'), 'task:created', task);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const task = await tasksService.update(req.params.id, req.body, req.user);
    emitToAll(req.app.get('io'), 'task:updated', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const task = await tasksService.updateStatus(req.params.id, req.body.status, req.user);
    emitToAll(req.app.get('io'), 'task:updated', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await tasksService.remove(req.params.id, req.user);
    emitToAll(req.app.get('io'), 'task:deleted', { id: req.params.id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const exportCsv = async (req, res, next) => {
  try {
    const csv = await tasksService.exportCsv(req.user, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, updateStatus, remove, exportCsv };
