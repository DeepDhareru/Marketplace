const express = require('express');
const router = express.Router();
const { generateDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/generate-description', protect, authorizeRoles('seller'), generateDescription);

module.exports = router;