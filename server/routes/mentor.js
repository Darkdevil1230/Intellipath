const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMentors,
  getMentorById,
  bookSession,
  getBookings,
} = require('../controllers/mentorController');

router.get('/', getMentors);
router.get('/:id', getMentorById);
router.post('/book', protect, bookSession);
router.get('/bookings/my', protect, getBookings);

module.exports = router;
