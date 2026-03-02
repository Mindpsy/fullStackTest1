const { Task, Client } = require('../../common/db/models');
const { STATUSES } = require('../../common/constants/taskStatus');
const { PRIORITIES } = require('../../common/constants/priority');
const { ADMIN } = require('../../common/constants/roles');
const { invalidateStatsCache } = require('../../redis/cache');
const { scheduleReminder } = require('../../redis/queue');
const { stringify } = require('csv-stringify/sync');

async function buildQuery(user, filters) {
  const { role, _id } = user;
  const { status, priority, assigneeId, clientId, search } = filters;

  const query = {};
  if (role !== ADMIN) {
    const clientIds = await Client.find({ managerId: _id }).distinct('_id');
    query.clientId = { $in: clientIds };
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assigneeId) query.assigneeId = assigneeId;
  if (clientId) query.clientId = clientId;
  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: 'i' };
  }
  return query;
}

const list = async (user, queryParams) => {
  const { page = 1, limit = 10, status, priority, assigneeId, clientId, search } = queryParams;
  const q = await buildQuery(user, { status, priority, assigneeId, clientId, search });
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Task.find(q)
      .populate('clientId', 'name company')
      .populate('assigneeId', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Task.countDocuments(q),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id, user) => {
  const task = await Task.findById(id)
    .populate('clientId', 'name company managerId')
    .populate('assigneeId', 'name email');
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role !== ADMIN) {
    const client = await Client.findById(task.clientId._id || task.clientId);
    if (!client || client.managerId.toString() !== user._id.toString()) {
      const err = new Error('Access denied');
      err.statusCode = 403;
      throw err;
    }
  }
  return task;
};

const create = async (data, user) => {
  const client = await Client.findById(data.clientId);
  if (!client) {
    const err = new Error('Client not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role !== ADMIN && client.managerId.toString() !== user._id.toString()) {
    const err = new Error('Client does not belong to you');
    err.statusCode = 403;
    throw err;
  }

  const payload = {
    ...data,
    status: STATUSES.includes(data.status) ? data.status : 'pending',
    priority: PRIORITIES.includes(data.priority) ? data.priority : 'medium',
    assigneeId: data.assigneeId || user._id,
  };
  const task = await Task.create(payload);
  if (task.dueDate) {
    await scheduleReminder(task._id, task.dueDate, task.title);
  }
  await invalidateStatsCache();
  return task.populate('clientId', 'name company').populate('assigneeId', 'name email');
};

const update = async (id, data, user) => {
  const task = await Task.findById(id).populate('clientId');
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  const client = await Client.findById(task.clientId._id || task.clientId);
  if (!client) {
    const err = new Error('Client not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role !== ADMIN && client.managerId.toString() !== user._id.toString()) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  Object.assign(task, data);
  if (task.dueDate) {
    await scheduleReminder(task._id, task.dueDate, task.title);
  }
  await task.save();
  await invalidateStatsCache();
  return task.populate('clientId', 'name company').populate('assigneeId', 'name email');
};

const updateStatus = async (id, status, user) => {
  if (!STATUSES.includes(status)) {
    const err = new Error('Invalid status');
    err.statusCode = 400;
    throw err;
  }
  const task = await Task.findById(id).populate('clientId');
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  const client = await Client.findById(task.clientId._id || task.clientId);
  if (user.role !== ADMIN && client.managerId.toString() !== user._id.toString()) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }
  task.status = status;
  await task.save();
  await invalidateStatsCache();
  return task.populate('clientId', 'name company').populate('assigneeId', 'name email');
};

const remove = async (id, user) => {
  if (user.role !== ADMIN) {
    const err = new Error('Only admin can delete tasks');
    err.statusCode = 403;
    throw err;
  }
  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  await invalidateStatsCache();
  return { deleted: true };
};

const exportCsv = async (user, queryParams) => {
  const q = await buildQuery(user, {
    status: queryParams.status,
    priority: queryParams.priority,
    assigneeId: queryParams.assigneeId,
    clientId: queryParams.clientId,
    search: queryParams.search,
  });
  const tasks = await Task.find(q)
    .populate('clientId', 'name company')
    .populate('assigneeId', 'name')
    .sort({ dueDate: 1 })
    .lean();

  const rows = tasks.map((t) => ({
    title: t.title,
    description: (t.description || '').slice(0, 200),
    status: t.status,
    priority: t.priority,
    client: t.clientId ? t.clientId.name : '',
    assignee: t.assigneeId ? t.assigneeId.name : '',
    dueDate: t.dueDate || '',
    createdAt: t.createdAt,
  }));

  return stringify(rows, { header: true });
};

module.exports = { list, getById, create, update, updateStatus, remove, exportCsv };
