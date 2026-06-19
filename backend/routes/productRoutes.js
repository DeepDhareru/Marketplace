const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getSellerProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/', getProducts);
router.get('/seller/my', protect, authorizeRoles('seller'), getSellerProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('seller'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorizeRoles('seller'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorizeRoles('seller'), deleteProduct);

module.exports = router;