const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getChatHistory,
  getChatSession,
  deleteChatSession,
} = require('../controllers/chatController');

router.post('/message', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.get('/session/:id', protect, getChatSession);
router.delete('/session/:id', protect, deleteChatSession);

module.exports = router;
