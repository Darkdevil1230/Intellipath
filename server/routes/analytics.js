const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAnalytics, updateAnalytics, recordMilestone, recordPhaseCompletion, getProgressSummary } = require('../controllers/analyticsController');

router.get('/', protect, getAnalytics);
router.get('/summary', protect, getProgressSummary);
router.patch('/update', protect, updateAnalytics);
router.post('/milestone', protect, recordMilestone);
router.post('/phase-completion', protect, recordPhaseCompletion);

module.exports = router;
