const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD',
    },
  },
  growthOutlook: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
  },
  requiredSkills: [{
    type: String,
  }],
  topCompanies: [{
    type: String,
  }],
  educationRequirements: [{
    type: String,
  }],
  category: {
    type: String,
    enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'Creative', 'Business', 'Law', 'Other'],
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

module.exports = mongoose.model('Career', careerSchema);
