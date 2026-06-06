const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    enum: ['Coursera', 'Udemy', 'NPTEL', 'freeCodeCamp', 'CS50', 'YouTube', 'edX','Other'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  duration: {
    type: String,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  price: {
    type: Number,
    default: 0,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  tags: [{
    type: String,
  }],
  relatedCareers: [{
    type: String,
  }],
  relatedTopics: [{
    type: String,
  }],
  category: {
    type: String,
  },
  stream: {
    type: String,
    enum: ['Engineering', 'Science', 'Commerce', 'Arts', 'Medicine', 'Medical', 'Law', 'Management', 'IT'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', courseSchema);
