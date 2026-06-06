const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careerTitle: {
    type: String,
    required: true,
  },
  stream: {
    type: String,
    enum: ['Engineering', 'Science', 'Commerce', 'Arts', 'Medicine', 'Law', 'Management', 'IT'],
  },
  phases: [{
    phaseNumber: Number,
    title: String,
    description: String,
    duration: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    topics: [{
      name: String,
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
      },
      resources: [{
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['video', 'article', 'book', 'practice-site', 'tool', 'project', 'website', 'course', 'statute'],
        },
      }],
    }],
  }],
  projects: [{
    title: String,
    description: String,
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  }],
  certifications: [{
    title: String,
    provider: String,
    url: String,
    completed: {
      type: Boolean,
      default: false,
    },
  }],
  progress: {
    type: Number,
    default: 0,
  },
  progressPercentage: {
    type: Number,
    default: 0,
  },
  currentPhase: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

roadmapSchema.index({ user: 1, careerTitle: 1, createdAt: 1 });

roadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
