const Message = require('../models/Message');
const User = require('../models/User');

const getConversationId = (id1, id2) => {
  return [id1, id2].sort().join('_');
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all unique conversations for this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .populate('productId', 'name images');

    // Get unique conversations with last message
    const conversationMap = {};
    for (const msg of messages) {
      const otherId =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          conversationId: msg.conversationId,
          otherUser:
            msg.sender._id.toString() === userId.toString()
              ? msg.receiver
              : msg.sender,
          lastMessage: msg.message,
          lastTime: msg.createdAt,
          unreadCount: 0,
          product: msg.productId,
        };
      }

      // Count unread messages
      if (
        msg.receiver._id.toString() === userId.toString() &&
        !msg.isRead
      ) {
        conversationMap[otherId].unreadCount++;
      }
    }

    res.json(Object.values(conversationMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = getConversationId(
      req.user._id.toString(),
      userId
    );

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, productId } = req.body;
    const conversationId = getConversationId(
      req.user._id.toString(),
      receiverId
    );

    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: receiverId,
      message,
      productId: productId || null,
    });

    const populated = await newMessage.populate([
      { path: 'sender', select: 'name role' },
      { path: 'receiver', select: 'name role' },
      { path: 'productId', select: 'name images' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getUnreadCount };