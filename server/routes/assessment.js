const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateQuiz,
  submitAssessment,
  getAssessmentHistory,
  getAssessmentById,
} = require('../controllers/assessmentController');

router.post('/generate', protect, generateQuiz);
router.post('/submit', protect, submitAssessment);
router.get('/history', protect, getAssessmentHistory);
router.get('/:id', protect, getAssessmentById);

module.exports = router;
