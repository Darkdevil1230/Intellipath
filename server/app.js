const express = require('express');
const morgan = require('morgan');
const setupSecurity = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Routes
const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const roadmapRoutes = require('./routes/roadmap');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const assessmentRoutes = require('./routes/assessment');
const careerRoutes = require('./routes/career');
const courseRoutes = require('./routes/course');
const resourceRoutes = require('./routes/resource');
const mentorRoutes = require('./routes/mentor');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notification');
const monitorRoutes = require('./routes/monitor');

const app = express();

// Security middleware
setupSecurity(app);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/monitor', monitorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliPath API is running' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
