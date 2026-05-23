const express = require('express');
const router = express.Router();
const { createFlashSale, getActiveFlashSales, getSellerFlashSales, deleteFlashSale } = require('../controllers/flashSaleController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/active', getActiveFlashSales);
router.get('/my', protect, authorizeRoles('seller'), getSellerFlashSales);
router.post('/', protect, authorizeRoles('seller'), createFlashSale);
router.delete('/:id', protect, authorizeRoles('seller'), deleteFlashSale);

module.exports = router;