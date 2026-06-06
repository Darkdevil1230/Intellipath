require('dotenv').config();
const { REQUIRED_ENV_VARS, isMissing } = require('../config/env');

const missing = REQUIRED_ENV_VARS.filter(isMissing);

if (missing.length > 0) {
  console.error('Missing or placeholder environment variables:', missing.join(', '));
  process.exit(1);
}

console.log('All required environment variables are present.');
process.exit(0);
