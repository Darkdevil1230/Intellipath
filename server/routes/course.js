const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCourses,
  saveCourse,
  getSavedCourses,
  unsaveCourse,
} = require('../controllers/courseController');

router.get('/', getCourses);
router.post('/save', protect, saveCourse);
router.get('/saved', protect, getSavedCourses);
router.delete('/saved/:id', protect, unsaveCourse);

module.exports = router;
