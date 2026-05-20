const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders, getSellerOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('buyer'), createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my', protect, authorizeRoles('buyer'), getMyOrders);
router.get('/seller', protect, authorizeRoles('seller'), getSellerOrders);
router.put('/:id/status', protect, authorizeRoles('seller'), updateOrderStatus);

module.exports = router;