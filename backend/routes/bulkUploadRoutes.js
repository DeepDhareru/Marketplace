const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { bulkUploadProducts, downloadTemplate } = require('../controllers/bulkUploadController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `bulk_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only Excel and CSV files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload', protect, authorizeRoles('seller'), upload.single('file'), bulkUploadProducts);
router.get('/template', protect, authorizeRoles('seller'), downloadTemplate);

module.exports = router;