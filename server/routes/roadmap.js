const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRoadmap, getRoadmapById, updateProgress, regenerateRoadmap, markTopicComplete, updateCurrentPhase } = require('../controllers/roadmapController');

router.get('/', protect, getRoadmap);
router.get('/:id', protect, getRoadmapById);
router.patch('/progress', protect, updateProgress);
router.patch('/:id/topics/:topicName', protect, markTopicComplete);
router.patch('/:id/phase', protect, updateCurrentPhase);
router.post('/regenerate', protect, regenerateRoadmap);

module.exports = router;
