const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getSellerProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/seller/my', protect, authorizeRoles('seller'), getSellerProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('seller'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorizeRoles('seller'), updateProduct);
router.delete('/:id', protect, authorizeRoles('seller'), deleteProduct);

module.exports = router;