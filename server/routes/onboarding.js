const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { completeOnboarding, generateUserRoadmap } = require('../controllers/onboardingController');

router.post('/complete', protect, completeOnboarding);
router.post('/generate-roadmap', protect, generateUserRoadmap);

module.exports = router;
