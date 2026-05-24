const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/messages/:userId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.get('/unread', protect, getUnreadCount);

module.exports = router;