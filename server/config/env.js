const logger = require('./logger');

const PLACEHOLDER_PREFIX = 'your_';

const isMissing = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) return true;
  if (String(value).trim().startsWith(PLACEHOLDER_PREFIX)) return true;
  return false;
};

/** Required for every environment — server refuses to start if any are missing. */
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
];

const AI_PROVIDER_ENV_VARS = [
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
];

const hasAiProvider = () => AI_PROVIDER_ENV_VARS.some((name) => !isMissing(name));

/** Strongly recommended — logged as warnings but do not block startup. */
const RECOMMENDED_ENV_VARS = [
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'BACKEND_URL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(isMissing);
  const missingRecommended = RECOMMENDED_ENV_VARS.filter(isMissing);

  if (missing.length > 0) {
    logger.error(`Missing or placeholder REQUIRED environment variables: ${missing.join(', ')}`);
    logger.error('Copy server/.env.example to server/.env and set real values before starting.');
    process.exit(1);
  }

  if (!hasAiProvider()) {
    logger.warn(
      'No AI provider configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY to enable AI services. The server will still run using built-in fallback generators.'
    );
  }

  if (missingRecommended.length > 0) {
    logger.warn(`Recommended env vars not set: ${missingRecommended.join(', ')}`);
  }

  logger.info('Required environment variables validated.');
};

module.exports = { validateEnv, REQUIRED_ENV_VARS, isMissing };
