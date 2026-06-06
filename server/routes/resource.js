const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getResources,
  saveResource,
  getSavedResources,
  unsaveResource,
} = require('../controllers/resourceController');

router.get('/', getResources);
router.post('/save', protect, saveResource);
router.get('/saved', protect, getSavedResources);
router.delete('/saved/:id', protect, unsaveResource);

module.exports = router;
