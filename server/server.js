const http = require('http');
const config = require('./config');
const logger = require('./common/utils/logger');
const { connect } = require('./common/db');
const { initSocket } = require('./socket');
const { processReminders } = require('./redis/queue');
const app = require('./app');

const server = http.createServer(app);

connect().then(() => {
  const io = initSocket(server);
  app.set('io', io);

  processReminders();

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });
}).catch((err) => {
  logger.error('Failed to start:', err);
  process.exit(1);
});
