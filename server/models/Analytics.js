const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  topicsCompleted: {
    type: Number,
    default: 0,
  },
  hoursLearned: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  learningStreak: {
    type: Number,
    default: 0,
  },
  roadmapProgress: {
    type: Number,
    default: 0,
  },
  roadmapPhasesCompleted: [{
    phase: String,
    completedAt: Date,
  }],
  milestonesAchieved: [{
    name: String,
    achievedAt: Date,
  }],
  lastLearningDate: {
    type: Date,
  },
  skillsImproved: [{
    skill: String,
    level: {
      type: Number,
      min: 1,
      max: 10,
    },
  }],
  weeklyProgress: [{
    week: String,
    hoursLearned: Number,
    topicsCompleted: Number,
  }],
  monthlyProgress: [{
    month: String,
    hoursLearned: Number,
    topicsCompleted: Number,
  }],
  assessmentHistory: [{
    date: Date,
    score: Number,
    topic: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

analyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Analytics', analyticsSchema);
