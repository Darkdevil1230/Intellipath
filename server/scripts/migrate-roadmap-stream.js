#!/usr/bin/env node
/**
 * One-time migration: backfill roadmap.stream from user.academicStream
 *
 * Usage: node scripts/migrate-roadmap-stream.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const roadmaps = await Roadmap.find({});
  let updated = 0;
  let skipped = 0;
  let noUserStream = 0;

  for (const roadmap of roadmaps) {
    if (roadmap.stream) {
      skipped++;
      continue;
    }

    const user = await User.findById(roadmap.user);
    if (!user?.academicStream) {
      noUserStream++;
      console.warn(
        `  Skip roadmap ${roadmap._id} (${roadmap.careerTitle}): user has no academicStream`
      );
      continue;
    }

    roadmap.stream = user.academicStream;
    await roadmap.save();
    updated++;
    console.log(`  Updated ${roadmap._id} → stream="${user.academicStream}"`);
  }

  console.log('\nMigration complete');
  console.log(`  Total roadmaps: ${roadmaps.length}`);
  console.log(`  Updated:        ${updated}`);
  console.log(`  Already had stream: ${skipped}`);
  console.log(`  No user stream:     ${noUserStream}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
