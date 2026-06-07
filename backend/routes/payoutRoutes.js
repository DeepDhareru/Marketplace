const express = require('express');
const router = express.Router();
const { getSellerEarnings, requestPayout, getAllPayouts, updatePayoutStatus } = require('../controllers/payoutController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/earnings', protect, authorizeRoles('seller'), getSellerEarnings);
router.post('/request', protect, authorizeRoles('seller'), requestPayout);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllPayouts);
router.put('/admin/:id', protect, authorizeRoles('admin'), updatePayoutStatus);

module.exports = router;