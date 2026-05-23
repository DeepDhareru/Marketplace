const express = require('express');
const router = express.Router();
const { getProductQnA, askQuestion, answerQuestion, deleteQuestion } = require('../controllers/qnaController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/:productId', getProductQnA);
router.post('/:productId', protect, askQuestion);
router.put('/:id/answer', protect, authorizeRoles('seller'), answerQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;