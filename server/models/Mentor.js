const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  expertise: [{
    type: String,
  }],
  relatedCareers: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Unavailable'],
    default: 'Available',
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  linkedin: {
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

module.exports = mongoose.model('Mentor', mentorSchema);
