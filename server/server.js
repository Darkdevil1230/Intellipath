require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const { validateEnv } = require('./config/env');
const app = require('./app');

// Fail fast if required deployment variables are missing
validateEnv();

const setupMentorChat = require('./sockets/mentorChat');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupMentorChat(io);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
