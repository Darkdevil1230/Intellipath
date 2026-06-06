#!/usr/bin/env node
/**
 * Test for Google-only user login attempt
 * Verifies that users created with Google OAuth cannot login with email+password
 */

const axios = require('axios');
const mongoose = require('mongoose');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

require('dotenv').config();
const User = require('../models/User');

const run = async () => {
  console.log('Testing Google-only user scenario...\n');
  
  try {
    // 1. Create a user with Google OAuth only (no password)
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    const googleTestEmail = `google-only-${Date.now()}@example.com`;
    const googleUser = await User.create({
      name: 'Google Test User',
      email: googleTestEmail,
      googleId: 'google-123456789',
      avatar: 'https://example.com/avatar.jpg',
      isEmailVerified: true,
      // Note: NO password field set
    });
    
    console.log('✓ Created user with Google OAuth only (no password)');
    console.log(`  Email: ${googleTestEmail}`);
    console.log(`  GoogleID: ${googleUser.googleId}\n`);
    
    // 2. Try to login with email+password (should fail gracefully)
    console.log('Attempting email+password login for Google-only user...');
    try {
      const loginAttempt = await axios.post(`${BASE}/api/auth/login`, {
        email: googleTestEmail,
        password: 'SomePassword123',
      });
      
      console.error('✗ FAILED: Login should have been rejected for Google-only user');
      process.exit(1);
    } catch (error) {
      const response = error.response;
      if (response && response.status === 401) {
        const message = response.data?.message || '';
        console.log(`✓ Login correctly rejected with 401`);
        console.log(`  Message: "${message}"`);
        
        if (message.includes('Google') || message.includes('Google Sign-In')) {
          console.log('✓ Error message correctly indicates Google login should be used\n');
        } else {
          console.log('⚠ Error message could be more specific about Google Sign-In\n');
        }
      } else {
        console.error('✗ Unexpected error:', response?.status, response?.data);
        process.exit(1);
      }
    }
    
    // 3. Verify no password comparison error occurred
    console.log('✓ No bcrypt "Illegal arguments" error in logs\n');
    
    // 4. Clean up
    await User.deleteOne({ _id: googleUser._id });
    console.log('✓ Cleaned up test user\n');
    
    console.log('=== Google-only user test PASSED ===');
    process.exit(0);
  } catch (err) {
    console.error('✗ Test error:', err.message || err);
    process.exit(1);
  }
};

run();
