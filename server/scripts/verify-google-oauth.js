#!/usr/bin/env node
/**
 * Google OAuth Configuration Verification Helper
 * 
 * Verifies that:
 * 1. Client VITE_GOOGLE_CLIENT_ID exists
 * 2. Server GOOGLE_CLIENT_ID exists and matches client
 * 3. Provides next steps if misconfigured
 */

const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

const run = async () => {
  console.log('Google OAuth Configuration Verification');
  console.log('=====================================\n');
  
  try {
    // Get client ID from browser env
    const clientEnvValue = process.env.VITE_GOOGLE_CLIENT_ID;
    console.log('1. Client Environment (VITE_GOOGLE_CLIENT_ID):');
    if (clientEnvValue) {
      console.log(`   ✓ Set to: ${clientEnvValue}`);
    } else {
      console.log('   ✗ NOT SET. Please set VITE_GOOGLE_CLIENT_ID in client/.env');
    }
    
    // Get server ID from /api/auth/google-config endpoint
    console.log('\n2. Server Configuration:');
    let serverClientId = null;
    try {
      const res = await axios.get(`${BASE}/api/auth/google-config`);
      serverClientId = res.data?.clientId;
      if (serverClientId) {
        console.log(`   ✓ Set to: ${serverClientId}`);
      } else {
        console.log('   ✗ NOT SET on server. Set GOOGLE_CLIENT_ID in server/.env');
      }
    } catch (e) {
      console.log(`   ⚠ Could not reach ${BASE}/api/auth/google-config`);
      console.log('   Ensure the backend is running.');
    }
    
    // Compare
    console.log('\n3. Client/Server Comparison:');
    if (clientEnvValue && serverClientId) {
      if (clientEnvValue === serverClientId) {
        console.log('   ✓ Client and server IDs MATCH');
      } else {
        console.log('   ✗ MISMATCH detected:');
        console.log(`     Client: ${clientEnvValue}`);
        console.log(`     Server: ${serverClientId}`);
        console.log('   Please ensure both use the same OAuth 2.0 Web Client ID from Google Cloud.');
      }
    } else {
      console.log('   ⚠ Cannot compare: one or both IDs missing');
    }
    
    // Next steps
    console.log('\n4. Next Steps for Google OAuth Setup:');
    console.log('   a. Go to https://console.cloud.google.com');
    console.log('   b. Select your project');
    console.log('   c. Navigate to APIs & Services > Credentials');
    console.log('   d. Find your OAuth 2.0 Web Client (or create one)');
    console.log('   e. Under "Authorized JavaScript origins" add:');
    console.log('      - http://localhost:5173 (local dev)');
    console.log('      - http://127.0.0.1:5173');
    console.log('      - Your production domain (e.g., https://example.com)');
    console.log('   f. Under "Authorized redirect URIs" ensure:');
    console.log('      - http://localhost:5000/api/auth/google (local dev)');
    console.log('      - Your production backend URL');
    console.log('   g. Copy the Client ID and set:');
    console.log('      - VITE_GOOGLE_CLIENT_ID in client/.env');
    console.log('      - GOOGLE_CLIENT_ID in server/.env');
    console.log('   h. Restart both backend and frontend\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
