const { Client, Task } = require('../../common/db/models');
const { ADMIN } = require('../../common/constants/roles');
const { getStatsCache, setStatsCache } = require('../../redis/cache');

async function getBaseQuery(user) {
  if (user.role === ADMIN) {
    return { clients: {}, tasks: {} };
  }
  const managerId = user._id;
  const clientIds = await Client.find({ managerId }).distinct('_id');
  return {
    clients: { managerId },
    tasks: { clientId: { $in: clientIds } },
  };
}

const getStats = async (user) => {
  const userId = user._id.toString();
  const cached = await getStatsCache(userId);
  if (cached) return cached;

  const { clients: clientQuery, tasks: taskQuery } = await getBaseQuery(user);

  const [clientCount, taskCount, clientsByStatus, tasksByStatus] = await Promise.all([
    Client.countDocuments(clientQuery),
    Task.countDocuments(taskQuery),
    Client.aggregate([{ $match: clientQuery }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: taskQuery }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const clientStatusMap = { active: 0, inactive: 0, lead: 0 };
  clientsByStatus.forEach((s) => { clientStatusMap[s._id] = s.count; });
  const taskStatusMap = { pending: 0, in_progress: 0, completed: 0 };
  tasksByStatus.forEach((s) => { taskStatusMap[s._id] = s.count; });

  const result = {
    clientsTotal: clientCount,
    tasksTotal: taskCount,
    clientsByStatus: clientStatusMap,
    tasksByStatus: taskStatusMap,
  };
  await setStatsCache(userId, result);
  return result;
};

const getRecentActivities = async (user) => {
  const { clients: clientQuery, tasks: taskQuery } = await getBaseQuery(user);

  const [recentClients, recentTasks] = await Promise.all([
    Client.find(clientQuery)
      .populate('managerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Task.find(taskQuery)
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return { recentClients, recentTasks };
};

module.exports = { getStats, getRecentActivities };
