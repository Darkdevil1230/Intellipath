const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');

const setupSecurity = (app) => {
  // Helmet
  app.use(helmet());

  // Gzip Compression
  app.use(compression());

  // CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use('/api/', limiter);

  // Auth rate limiting (stricter in production, relaxed in development)
  const authMax = process.env.NODE_ENV === 'production' ? 5 : 100;
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: authMax,
    message: 'Too many auth attempts, please try again later.',
  });

  app.use('/api/auth/', authLimiter);

  // AI Endpoints Rate Limiting (10 requests per minute)
  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many AI requests from this IP, please try again in a minute.',
  });

  app.use('/api/onboarding/generate-roadmap', aiLimiter);
  app.use('/api/onboarding/complete', aiLimiter);
  app.use('/api/chat', aiLimiter);
};

module.exports = setupSecurity;
