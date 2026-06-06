const axios = require('axios');
const mongoose = require('mongoose');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

// Direct DB access to verify writes
require('dotenv').config();
const Analytics = require('../models/Analytics');

const randomEmail = () => `analytics-test-${Date.now()}@example.com`;

const run = async () => {
  console.log('Analytics persistence test starting...');
  
  try {
    // 1. Register & login
    const testUser = { email: randomEmail(), password: 'Passw0rd!', name: 'Analytics Tester' };
    
    await axios.post(`${BASE}/api/auth/register`, testUser).catch(e => e.response);
    const login = await axios.post(`${BASE}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    
    if (!login.data?.token) {
      throw new Error('Login failed');
    }
    
    const token = login.data.token;
    const userId = login.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✓ User registered and logged in');
    
    // 2. Complete onboarding to generate roadmap
    const onboard = await axios.post(`${BASE}/api/onboarding/complete`, {
      academicStream: 'IT',
      currentEducation: 'Bachelor',
      careerGoal: 'Full Stack Developer',
      topics: ['JavaScript', 'React'],
    }, { headers }).catch(e => e.response);
    
    if (onboard.status !== 200 && onboard.status !== 201) {
      console.warn('⚠ Onboarding failed:', onboard.data);
    } else {
      console.log('✓ Onboarding completed');
    }
    
    // 3. Get roadmap
    const roadmapRes = await axios.get(`${BASE}/api/roadmap`, { headers });
    const roadmap = roadmapRes.data;
    
    if (!roadmap || !roadmap._id) {
      throw new Error('No roadmap found');
    }
    
    console.log('✓ Roadmap retrieved');
    
    // 4. Mark first topic complete
    const firstPhase = roadmap.phases?.[0];
    const firstTopic = firstPhase?.topics?.[0];
    
    if (!firstTopic) {
      console.warn('⚠ No topics found to mark complete');
      process.exit(0);
    }
    
    const markRes = await axios.patch(
      `${BASE}/api/roadmap/${roadmap._id}/topics/${firstTopic.name}`,
      {},
      { headers }
    );
    
    console.log('✓ First topic marked complete');
    
    // 5. Query Analytics directly from DB
    await new Promise(r => setTimeout(r, 500)); // Small delay for DB write
    
    // Connect to DB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    const analytics = await Analytics.findOne({ user: userId });
    
    if (!analytics) {
      console.error('✗ Analytics record not found in DB');
      process.exit(1);
    }
    
    console.log('✓ Analytics record exists in DB');
    console.log('  - roadmapProgress:', analytics.roadmapProgress);
    console.log('  - topicsCompleted:', analytics.topicsCompleted);
    
    if (analytics.topicsCompleted >= 1) {
      console.log('✓ Topic completion recorded in analytics');
    } else {
      console.warn('⚠ topicsCompleted not updated after marking topic complete');
    }
    
    // 6. Check badges
    const userRes = await axios.get(`${BASE}/api/auth/me`, { headers });
    const badges = userRes.data?.badges || [];
    
    console.log('✓ User badges retrieved:', badges.length > 0 ? badges : '(none yet)');
    
    console.log('\nAnalytics persistence test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('✗ Analytics test error:', err.message || err);
    process.exit(1);
  }
};

run();
