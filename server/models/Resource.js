const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'article', 'book', 'practice-site', 'tool', 'project', 'website', 'course', 'statute'],
    required: true,
  },
  thumbnail: {
    type: String,
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
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
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

module.exports = mongoose.model('Resource', resourceSchema);
