const { Client, User } = require('../../common/db/models');
const { STATUSES } = require('../../common/constants/clientStatus');
const { ADMIN } = require('../../common/constants/roles');
const {
  getClientsCache,
  setClientsCache,
  invalidateClientsCache,
  invalidateStatsCache,
} = require('../../redis/cache');
const { stringify } = require('csv-stringify/sync');

function buildQuery(user, filters) {
  const { role, _id } = user;
  const { status, managerId, search } = filters;

  const query = {};
  if (role !== ADMIN) {
    query.managerId = _id;
  }
  if (status) query.status = status;
  if (managerId && role === ADMIN) query.managerId = managerId;
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { company: { $regex: s, $options: 'i' } },
    ];
  }
  return query;
}

const list = async (user, queryParams) => {
  const { page = 1, limit = 10, status, managerId, search } = queryParams;
  const userId = user._id.toString();

  const cached = await getClientsCache(userId, page, limit, status, managerId, search);
  if (cached) return cached;

  const q = buildQuery(user, { status, managerId, search });
  const skip = (page - 1) * limit;

  let findQuery = Client.find(q).populate('managerId', 'name email').sort({ createdAt: -1 });
  if (!search || !search.trim()) {
    findQuery = findQuery.lean();
  } else {
    findQuery = findQuery.lean();
  }

  const [data, total] = await Promise.all([
    findQuery.skip(skip).limit(Number(limit)),
    Client.countDocuments(q),
  ]);

  const result = { data, total, page: Number(page), limit: Number(limit) };
  await setClientsCache(userId, page, limit, status, managerId, search, result);
  return result;
};

const getById = async (id, user) => {
  const client = await Client.findById(id).populate('managerId', 'name email');
  if (!client) {
    const err = new Error('Client not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role !== ADMIN && client.managerId._id.toString() !== user._id.toString()) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }
  return client;
};

const create = async (data, user) => {
  const payload = {
    ...data,
    managerId: user.role === ADMIN && data.managerId ? data.managerId : user._id,
    status: STATUSES.includes(data.status) ? data.status : 'lead',
  };
  const client = await Client.create(payload);
  await invalidateClientsCache();
  await invalidateStatsCache();
  return client.populate('managerId', 'name email');
};

const update = async (id, data, user) => {
  const client = await Client.findById(id);
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
  Object.assign(client, data);
  if (data.managerId && user.role === ADMIN) client.managerId = data.managerId;
  await client.save();
  await invalidateClientsCache();
  await invalidateStatsCache();
  return client.populate('managerId', 'name email');
};

const remove = async (id, user) => {
  if (user.role !== ADMIN) {
    const err = new Error('Only admin can delete clients');
    err.statusCode = 403;
    throw err;
  }
  const client = await Client.findByIdAndDelete(id);
  if (!client) {
    const err = new Error('Client not found');
    err.statusCode = 404;
    throw err;
  }
  await invalidateClientsCache();
  await invalidateStatsCache();
  return { deleted: true };
};

const exportCsv = async (user, queryParams) => {
  const q = buildQuery(user, {
    status: queryParams.status,
    managerId: queryParams.managerId,
    search: queryParams.search,
  });
  const clients = await Client.find(q)
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const rows = clients.map((c) => ({
    name: c.name,
    email: c.email || '',
    phone: c.phone || '',
    company: c.company || '',
    status: c.status,
    manager: c.managerId ? c.managerId.name : '',
    notes: (c.notes || '').slice(0, 200),
    createdAt: c.createdAt,
  }));

  return stringify(rows, { header: true });
};

module.exports = { list, getById, create, update, remove, exportCsv };
