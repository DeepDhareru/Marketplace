const express = require('express');
const router = express.Router();
const {
  register, login, getProfile, updateProfile,
  addAddress, deleteAddress, getAddresses,
  getReferralStats, applyReferralCredits,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.get('/referral/stats', protect, getReferralStats);
router.post('/referral/apply-credits', protect, applyReferralCredits);

module.exports = router;