const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  updateProfile,
  updateSettings,
  deleteAccount,
} = require('../controllers/profileController');

router.patch('/update', protect, updateProfile);
router.patch('/settings', protect, updateSettings);
router.delete('/delete', protect, deleteAccount);

module.exports = router;
