const express = require('express');
const router = express.Router();
const {
  requestReturn,
  getMyReturns,
  getSellerReturns,
  updateReturnStatus,
  getAdminReturns,
} = require('../controllers/returnController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('buyer'), requestReturn);
router.get('/my', protect, authorizeRoles('buyer'), getMyReturns);
router.get('/seller', protect, authorizeRoles('seller'), getSellerReturns);
router.put('/:id/status', protect, authorizeRoles('seller'), updateReturnStatus);
router.get('/admin', protect, authorizeRoles('admin'), getAdminReturns);

module.exports = router;