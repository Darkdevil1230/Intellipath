const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

const randomEmail = () => `smoke+${Date.now()}@example.com`;

const run = async () => {
  console.log('Smoke tests starting against', BASE);

  try {
    const health = await axios.get(`${BASE}/health`);
    console.log('/health', health.data);

    const testUser = { email: randomEmail(), password: 'Passw0rd!' };

    // Register
    const reg = await axios.post(`${BASE}/api/auth/register`, {
      email: testUser.email,
      password: testUser.password,
      name: 'Smoke Tester'
    }).catch(e => e.response || e);

    console.log('register status:', reg.status || reg.statusCode || 'ERR');

    // Login
    const login = await axios.post(`${BASE}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    }).catch(e => e.response || e);

    if (!login || !login.data || !login.data.token) {
      console.error('login failed', login.data || login.status || login);
      process.exit(2);
    }

    console.log('login OK');
    const token = login.data.token;

    // Get me
    const me = await axios.get(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('/api/auth/me', me.data?.email || me.data?.user || 'OK');

    // Forgot password
    const forgot = await axios.post(`${BASE}/api/auth/forgot-password`, { email: testUser.email }).catch(e => e.response || e);
    console.log('forgot-password response:', forgot.data || forgot.status);

    // Google config
    const googleCfg = await axios.get(`${BASE}/api/auth/google-config`).catch(() => null);
    console.log('google-config:', googleCfg?.data || null);

    console.log('Smoke tests completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Smoke tests error:', err.message || err);
    process.exit(1);
  }
};

run();
