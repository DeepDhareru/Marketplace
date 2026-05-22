const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  toggleVerification,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  getStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/verify', toggleVerification);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getAllOrders);

module.exports = router;