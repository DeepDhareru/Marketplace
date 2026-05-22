const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type, link }) => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

module.exports = createNotification;