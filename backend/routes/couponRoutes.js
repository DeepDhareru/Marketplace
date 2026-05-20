const express = require('express');
const router = express.Router();
const { createCoupon, validateCoupon, getMyCoupons, deleteCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/validate', protect, validateCoupon);
router.post('/', protect, authorizeRoles('seller'), createCoupon);
router.get('/my', protect, authorizeRoles('seller'), getMyCoupons);
router.delete('/:id', protect, authorizeRoles('seller'), deleteCoupon);

module.exports = router;