const Queue = require('bull');
const config = require('../config');
const { getRedis } = require('./client');
const logger = require('../common/utils/logger');

const REMINDER_QUEUE = 'task-reminders';
const REMINDER_MINUTES = 5;

let reminderQueue = null;
let io = null;

const getReminderQueue = () => {
  if (!reminderQueue) {
    reminderQueue = new Queue(REMINDER_QUEUE, config.redisUrl, {
      defaultJobOptions: { removeOnComplete: 100 },
    });
    reminderQueue.on('error', (err) => logger.error('Bull queue error:', err));
  }
  return reminderQueue;
};

const setSocketIo = (socketIo) => {
  io = socketIo;
};

const scheduleReminder = async (taskId, dueDate, taskTitle) => {
  if (!dueDate) return;
  const runAt = new Date(dueDate.getTime() - REMINDER_MINUTES * 60 * 1000);
  if (runAt <= new Date()) return;

  const queue = getReminderQueue();
  await queue.add(
    { taskId, taskTitle, dueDate: dueDate.toISOString() },
    { delay: runAt.getTime() - Date.now() }
  );
};

const processReminders = () => {
  const queue = getReminderQueue();
  queue.process(async (job) => {
    const { taskId, taskTitle, dueDate } = job.data;
    logger.info(`Reminder: Task "${taskTitle}" (${taskId}) due at ${dueDate}`);
    if (io) {
      io.to('all').emit('reminder', { taskId, taskTitle, dueDate });
    }
  });
};

module.exports = {
  getReminderQueue,
  setSocketIo,
  scheduleReminder,
  processReminders,
  REMINDER_MINUTES,
};
